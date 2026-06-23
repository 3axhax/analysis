from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import pdfplumber
from io import BytesIO
import uvicorn
import os
from typing import List, Any, Optional
import json

app = FastAPI(title="PDF Table Extractor", version="1.0.0")

@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса для Docker healthcheck"""
    return {"status": "healthy"}

@app.post("/extract-tables")
async def extract_tables(
    file: UploadFile = File(...),
    pages: Optional[str] = None,  # "1,2,3" или "1-5"
    table_settings: Optional[str] = None  # JSON строка с настройками
):
    """
    Извлекает таблицы из PDF файла
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are allowed")

    try:
        content = await file.read()
        pdf_bytes = BytesIO(content)

        # Парсим параметры страниц
        page_numbers = None
        if pages:
            if '-' in pages:
                start, end = map(int, pages.split('-'))
                page_numbers = list(range(start, end + 1))
            else:
                page_numbers = [int(p.strip()) for p in pages.split(',')]

        # Настройки для pdfplumber
        default_table_settings = {
            "vertical_strategy": "lines",  # или "text", "explicit"
            "horizontal_strategy": "lines",
            "snap_tolerance": 3,
        }

        if table_settings:
            custom_settings = json.loads(table_settings)
            default_table_settings.update(custom_settings)

        result = {
            "success": True,
            "total_pages": 0,
            "tables": [],
            "all_text": ""
        }

        with pdfplumber.open(pdf_bytes) as pdf:
            result["total_pages"] = len(pdf.pages)

            pages_to_process = page_numbers if page_numbers else range(1, len(pdf.pages) + 1)

            for page_num in pages_to_process:
                page = pdf.pages[page_num - 1]

                # Извлекаем текст страницы для отладки
                page_text = page.extract_text()
                if page_text:
                    result["all_text"] += f"\n--- Page {page_num} ---\n{page_text}"

                # Пробуем извлечь таблицы разными способами
                tables_on_page = []

                # Способ 1: Автоматическое определение таблиц
                try:
                    tables = page.extract_tables(default_table_settings)
                    for table in tables:
                        if table and len(table) > 1:  # Игнорируем пустые
                            cleaned_table = clean_table(table)
                            if cleaned_table:
                                tables_on_page.append({
                                    "method": "auto",
                                    "data": cleaned_table,
                                    "rows": len(cleaned_table),
                                    "cols": len(cleaned_table[0]) if cleaned_table else 0
                                })
                except Exception as e:
                    print(f"Auto table extraction failed for page {page_num}: {e}")

                # Способ 2: Поиск таблиц по визуальным линиям
                try:
                    lines_tables = page.find_tables()
                    for table in lines_tables:
                        table_data = table.extract()
                        if table_data:
                            cleaned_table = clean_table(table_data)
                            if cleaned_table:
                                tables_on_page.append({
                                    "method": "lines",
                                    "data": cleaned_table,
                                    "rows": len(cleaned_table),
                                    "cols": len(cleaned_table[0]) if cleaned_table else 0,
                                    "bbox": table.bbox
                                })
                except Exception as e:
                    print(f"Lines table extraction failed for page {page_num}: {e}")

                # Способ 3: Извлечение текста с координатами для сложных случаев
                if not tables_on_page:
                    chars = page.chars
                    if chars:
                        # Группируем символы в строки по Y
                        rows_data = group_chars_by_rows(chars)
                        if rows_data:
                            tables_on_page.append({
                                "method": "coordinates",
                                "data": rows_data,
                                "rows": len(rows_data)
                            })

                if tables_on_page:
                    result["tables"].append({
                        "page": page_num,
                        "tables": tables_on_page
                    })

            # Если ничего не нашли, возвращаем весь текст
            if not result["tables"] and result["all_text"]:
                result["fallback_text"] = result["all_text"]

        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(500, f"PDF processing error: {str(e)}")

def clean_table(table: List[List[Any]]) -> List[List[str]]:
    """Очищает таблицу от пустых строк и None значений"""
    cleaned = []
    for row in table:
        clean_row = [str(cell).strip() if cell is not None else "" for cell in row]
        # Пропускаем строки, где все ячейки пустые
        if any(clean_row):
            cleaned.append(clean_row)
    return cleaned

def group_chars_by_rows(chars: List[dict], tolerance: int = 3) -> List[List[str]]:
    """Группирует символы в строки по Y координате"""
    rows = {}

    for char in chars:
        y = round(char['y0'])
        # Ищем существующую строку с близким Y
        found = False
        for row_y in list(rows.keys()):
            if abs(row_y - y) <= tolerance:
                rows[row_y].append(char)
                found = True
                break
        if not found:
            rows[y] = [char]

    # Сортируем строки и символы внутри строк
    sorted_rows = []
    for y in sorted(rows.keys()):
        row_chars = sorted(rows[y], key=lambda c: c['x0'])
        row_text = ''.join([c['text'] for c in row_chars])
        if row_text.strip():
            sorted_rows.append([row_text])

    return sorted_rows

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )