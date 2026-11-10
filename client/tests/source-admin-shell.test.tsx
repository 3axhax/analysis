import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({
  get: vi.fn(async (url: string) => {
    if (url === "/admin/medical-sources")
      return {
        data: [
          { id: 1, parentId: null, name: "Group" },
          { id: 2, parentId: 1, name: "Document" },
        ],
      };
    if (url === "/analysisPoint")
      return {
        data: [
          {
            id: 10,
            name: "alpha",
            translationRu: "Альфа",
            translationEn: "Alpha",
          },
          {
            id: 11,
            name: "beta",
            translationRu: "Бета",
            translationEn: "Beta",
          },
        ],
      };
    if (url.endsWith("/groups/1/points"))
      return {
        data: [
          { pointId: 10, sourceId: 2, name: "Альфа", limits: [] },
          { pointId: 11, sourceId: 2, name: "Бета", limits: [] },
        ],
      };
    if (url.endsWith("/groups/1/descriptions"))
      return {
        data: [
          {
            id: 20,
            sourceId: 2,
            description: "Описание А",
            conditions: [{ pointId: 10, name: "Альфа", status: "0" }],
          },
          {
            id: 21,
            sourceId: 2,
            description: "Описание Б",
            conditions: [{ pointId: 11, name: "Бета", status: "0" }],
          },
        ],
      };
    if (url === "/admin/medical-sources/dictionaries")
      return {
        data: { points: [], ages: [], genders: [], units: [], links: [] },
      };
    return { data: [] };
  }),
}));
vi.mock("../src/shared/transport/RestAPI", () => ({
  default: { get, post: vi.fn() },
}));
vi.mock("../src/shared/store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (state: object) => unknown) =>
    selector({
      analysisPoint: {
        list: [
          { id: 10, translationRu: "Альфа" },
          { id: 11, translationRu: "Бета" },
        ],
      },
    }),
}));
vi.mock("@app/providers/infoModalProvider", () => ({
  useInfoModalData: () => ({ openModal: vi.fn() }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { SourceContext } from "../src/features/Admin/sourceAdmin/SourceAdmin";

describe("shared source administration page", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it.each(["points", "descriptions"] as const)(
    "opens both contexts and resets the form when switching %s",
    async (kind) => {
      render(
        <SourceContext kind={kind}>
          {(open, setOpen) => (
            <div>
              <span>Common content</span>
              {open && (
                <button onClick={() => setOpen(false)}>Close common</button>
              )}
            </div>
          )}
        </SourceContext>,
      );
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      fireEvent.click(
        screen.getAllByRole("button", { name: "editDialog.add" })[0],
      );
      expect(screen.getByText("Close common")).toBeTruthy();
      fireEvent.click(screen.getByText("Close common"));
      const source = screen.getByRole("combobox", { name: "Источник данных" });
      fireEvent.keyDown(source, { key: "ArrowDown" });
      await waitFor(() => expect(screen.getByText("Group")).toBeTruthy());
      fireEvent.click(screen.getByText("Group"));
      await waitFor(() =>
        expect(
          screen.getByText(kind === "points" ? "Альфа" : "Описание А"),
        ).toBeTruthy(),
      );
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
      fireEvent.click(
        screen.getAllByRole("button", { name: "editDialog.add" })[0],
      );
      await waitFor(() => expect(screen.getByRole("dialog")).toBeTruthy());
      fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    },
  );
  it("uses common point filters for a selected source and clears them", async () => {
    render(
      <SourceContext kind="points">
        {() => <div>Common content</div>}
      </SourceContext>,
    );
    fireEvent.keyDown(
      screen.getByRole("combobox", { name: "Источник данных" }),
      { key: "ArrowDown" },
    );
    await waitFor(() => expect(screen.getByText("Group")).toBeTruthy());
    fireEvent.click(screen.getByText("Group"));
    await waitFor(() => expect(screen.getByText("Альфа")).toBeTruthy());
    fireEvent.change(screen.getByLabelText("analysisPoint.translationEn"), {
      target: { value: "beta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Применить фильтр" }));
    expect(screen.queryByText("Альфа")).toBeNull();
    expect(screen.getByText("Бета")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Сбросить фильтр" }));
    expect(screen.getByText("Альфа")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("analysisPoint.name"), {
      target: { value: "unfinished" },
    });
    fireEvent.keyDown(
      screen.getByRole("combobox", { name: "Источник данных" }),
      { key: "ArrowDown" },
    );
    fireEvent.click(screen.getByText("Без источников"));
    expect(
      (screen.getByLabelText("analysisPoint.name") as HTMLInputElement).value,
    ).toBe("");
  });
  it("uses the same parameter selector for source descriptions", async () => {
    render(
      <SourceContext kind="descriptions">
        {() => <div>Common content</div>}
      </SourceContext>,
    );
    fireEvent.keyDown(
      screen.getByRole("combobox", { name: "Источник данных" }),
      { key: "ArrowDown" },
    );
    await waitFor(() => expect(screen.getByText("Group")).toBeTruthy());
    fireEvent.click(screen.getByText("Group"));
    await waitFor(() => expect(screen.getByText("Описание А")).toBeTruthy());
    const selector = screen
      .getAllByRole("combobox")
      .find((item) => item.id === "analysisPoint")!;
    fireEvent.keyDown(selector, { key: "ArrowDown" });
    fireEvent.click(screen.getAllByText("Бета").at(-1)!);
    fireEvent.click(screen.getByRole("button", { name: "Применить фильтр" }));
    expect(screen.queryByText("Описание А")).toBeNull();
    expect(screen.getByText("Описание Б")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Сбросить фильтр" }));
    expect(screen.getByText("Описание А")).toBeTruthy();
  });
});
