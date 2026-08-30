import asyncio
import json
import multiprocessing
import os
import resource
from io import BytesIO
from typing import Any, Optional

import pdfplumber
import pytesseract
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pytesseract import Output


MAX_FILE_SIZE = int(os.getenv("PDF_MAX_FILE_SIZE", str(10 * 1024 * 1024)))
MAX_PAGES = int(os.getenv("PDF_MAX_PAGES", "5"))
PROCESS_TIMEOUT_SECONDS = int(os.getenv("PDF_PROCESS_TIMEOUT_SECONDS", "45"))
WORKER_MEMORY_MB = int(os.getenv("PDF_WORKER_MEMORY_MB", "512"))
MAX_CONCURRENT_REQUESTS = int(os.getenv("PDF_MAX_CONCURRENT_REQUESTS", "2"))
OCR_LANGUAGES = os.getenv("PDF_OCR_LANGUAGES", "rus+eng")
ALLOWED_TABLE_SETTINGS = {
    "vertical_strategy", "horizontal_strategy", "snap_tolerance",
    "join_tolerance", "intersection_tolerance", "text_tolerance",
    "min_words_vertical", "min_words_horizontal",
}

app = FastAPI(title="PDF Table Extractor", version="2.0.0")
request_slots = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


def parse_pages(value: Optional[str]) -> list[int]:
    if not value:
        return list(range(1, MAX_PAGES + 1))
    try:
        if "-" in value:
            parts = value.split("-")
            if len(parts) != 2:
                raise ValueError
            start, end = (int(part.strip()) for part in parts)
            pages = list(range(start, end + 1))
        else:
            pages = [int(part.strip()) for part in value.split(",")]
    except ValueError as exc:
        raise HTTPException(422, "Invalid pages selection") from exc
    if not pages or any(page < 1 for page in pages) or pages != sorted(set(pages)):
        raise HTTPException(422, "Invalid pages selection")
    if len(pages) > MAX_PAGES or pages[-1] > MAX_PAGES:
        raise HTTPException(422, f"At most {MAX_PAGES} pages are allowed")
    return pages


def parse_table_settings(value: Optional[str]) -> dict[str, Any]:
    settings: dict[str, Any] = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
    }
    if not value:
        return settings
    try:
        custom = json.loads(value)
    except json.JSONDecodeError as exc:
        raise HTTPException(422, "Invalid table settings") from exc
    if not isinstance(custom, dict) or set(custom) - ALLOWED_TABLE_SETTINGS:
        raise HTTPException(422, "Unsupported table settings")
    if custom.get("vertical_strategy") not in (None, "lines", "text"):
        raise HTTPException(422, "Unsupported vertical strategy")
    if custom.get("horizontal_strategy") not in (None, "lines", "text"):
        raise HTTPException(422, "Unsupported horizontal strategy")
    settings.update(custom)
    return settings


async def read_limited(file: UploadFile) -> bytes:
    chunks: list[bytes] = []
    size = 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > MAX_FILE_SIZE:
            raise HTTPException(413, "PDF exceeds the size limit")
        chunks.append(chunk)
    return b"".join(chunks)


def clean_table(table: list[list[Any]]) -> list[list[str]]:
    cleaned: list[list[str]] = []
    for row in table:
        clean_row = [str(cell).strip() if cell is not None else "" for cell in row]
        if any(clean_row):
            cleaned.append(clean_row)
    return cleaned


def group_words_by_rows(words: list[dict[str, Any]], tolerance: int = 4) -> list[list[str]]:
    rows: list[dict[str, Any]] = []
    for word in sorted(words, key=lambda item: (float(item["top"]), float(item["x0"]))):
        top = float(word["top"])
        row = next((item for item in rows if abs(item["top"] - top) <= tolerance), None)
        if row is None:
            row = {"top": top, "words": []}
            rows.append(row)
        row["words"].append(word)
    result: list[list[str]] = []
    for row in sorted(rows, key=lambda item: item["top"]):
        text = " ".join(
            str(word["text"]).strip()
            for word in sorted(row["words"], key=lambda item: float(item["x0"]))
            if str(word["text"]).strip()
        )
        if text:
            result.append([text])
    return result


def extract_ocr_rows(page: Any) -> list[list[str]]:
    image = page.to_image(resolution=200, antialias=True).original
    try:
        orientation = pytesseract.image_to_osd(image, output_type=Output.DICT)
        rotation = int(orientation.get("rotate", 0))
        if rotation:
            image = image.rotate(rotation, expand=True)
    except pytesseract.TesseractError:
        pass
    data = pytesseract.image_to_data(image, lang=OCR_LANGUAGES, output_type=Output.DICT)
    words: list[dict[str, Any]] = []
    for index, word_text in enumerate(data["text"]):
        if not word_text.strip() or float(data["conf"][index]) < 20:
            continue
        words.append({"text": word_text, "top": data["top"][index], "x0": data["left"][index]})
    return group_words_by_rows(words, tolerance=8)


def add_table(
    tables: list[dict[str, Any]], seen: set[tuple[tuple[str, ...], ...]],
    method: str, data: list[list[Any]],
) -> None:
    cleaned = clean_table(data)
    signature = tuple(tuple(cell.casefold() for cell in row) for row in cleaned)
    if not cleaned or signature in seen:
        return
    seen.add(signature)
    tables.append({
        "method": method,
        "data": cleaned,
        "rows": len(cleaned),
        "cols": max((len(row) for row in cleaned), default=0),
    })


def process_pdf(content: bytes, requested_pages: list[int], table_settings: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {
        "success": True, "total_pages": 0, "pages_processed": 0,
        "pages_ocr": 0, "tables": [],
    }
    with pdfplumber.open(BytesIO(content)) as pdf:
        result["total_pages"] = len(pdf.pages)
        for page_number in [page for page in requested_pages if page <= len(pdf.pages)]:
            page = pdf.pages[page_number - 1]
            tables: list[dict[str, Any]] = []
            seen: set[tuple[tuple[str, ...], ...]] = set()

            try:
                for table in page.extract_tables(table_settings) or []:
                    add_table(tables, seen, "lines", table)
            except Exception:
                pass
            text_settings = {
                "vertical_strategy": "text", "horizontal_strategy": "text",
                "min_words_vertical": 2, "min_words_horizontal": 1,
            }
            try:
                for table in page.extract_tables(text_settings) or []:
                    add_table(tables, seen, "text", table)
            except Exception:
                pass
            words = page.extract_words(use_text_flow=True, keep_blank_chars=False) or []
            if words:
                add_table(tables, seen, "coordinates", group_words_by_rows(words))
            page_text = (page.extract_text() or "").strip()
            needs_ocr = (
                not words or len(page_text) < 20
                or (bool(page.images) and len(page_text) < 200)
            )
            if needs_ocr:
                ocr_rows = extract_ocr_rows(page)
                if ocr_rows:
                    add_table(tables, seen, "ocr", ocr_rows)
                    result["pages_ocr"] += 1
            if tables:
                result["tables"].append({"page": page_number, "tables": tables})
            result["pages_processed"] += 1
    return result


def worker(connection: Any, content: bytes, pages: list[int], settings: dict[str, Any]) -> None:
    try:
        memory_bytes = WORKER_MEMORY_MB * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
        connection.send(("ok", process_pdf(content, pages, settings)))
    except Exception:
        connection.send(("invalid_pdf", None))
    finally:
        connection.close()


def run_isolated(content: bytes, pages: list[int], settings: dict[str, Any]) -> tuple[str, Any]:
    context = multiprocessing.get_context("spawn")
    parent, child = context.Pipe(duplex=False)
    process = context.Process(target=worker, args=(child, content, pages, settings))
    process.start()
    child.close()
    try:
        if not parent.poll(PROCESS_TIMEOUT_SECONDS):
            process.terminate()
            process.join(timeout=2)
            return "timeout", None
        try:
            return parent.recv()
        except EOFError:
            return "invalid_pdf", None
    finally:
        parent.close()
        if process.is_alive():
            process.terminate()
        process.join(timeout=2)


@app.post("/extract-tables")
async def extract_tables(
    file: UploadFile = File(...),
    pages: Optional[str] = Form(None),
    table_settings: Optional[str] = Form(None),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are allowed")
    content = await read_limited(file)
    if not content.startswith(b"%PDF-"):
        raise HTTPException(422, "Invalid PDF")
    requested_pages = parse_pages(pages)
    settings = parse_table_settings(table_settings)
    async with request_slots:
        status, result = await asyncio.to_thread(run_isolated, content, requested_pages, settings)
    if status == "timeout":
        raise HTTPException(503, "PDF processing timed out")
    if status != "ok":
        raise HTTPException(422, "PDF cannot be processed")
    return JSONResponse(content=result)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, log_level="info")
