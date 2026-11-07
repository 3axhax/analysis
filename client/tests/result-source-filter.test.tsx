import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { AnalysisResultPage } from "@pages/analysisResult/AnalysisResultPage";
import type { SelectUIOption } from "@shared/ui/SelectUI";

const sample = {
  resultId: "synthetic",
  result: { Gender: { name: "m" }, ageInDays: 10000, analysisResultPointData: [] },
  descriptions: [{ id: 1, description_ru: "Общий вывод", analysisResultDescriptionConditions: [{ id: 1, analysisPoint: { id: 1, name: "first" }, status: "0" }] }],
  sourceDescriptions: [{ source: { id: 2, name: "Документ", rootId: 1, rootName: "Библиотека", metadata: {} }, inheritedPointIds: [], descriptions: [{ id: 2, description_ru: "Внешний вывод", analysisResultDescriptionConditions: [{ id: 2, analysisPoint: { id: 2, name: "second" }, status: "1" }] }] }],
};
vi.mock("@shared/store/hooks.ts", () => ({ useAppSelector: (selector: (state: unknown) => unknown) => selector({ analysisResult: { results: { synthetic: sample } } }) }));
vi.mock("@entities/analysisResult/analysisResults.hooks.ts", () => ({ useAnalysisResultsLoad: () => {} }));
vi.mock("@widgets/analysisPointdataList", () => ({ AnalysisPointDataList: () => null }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("react-select", () => ({ default: ({ value, options, onChange }: { value: SelectUIOption<string>[]; options: SelectUIOption<string>[]; onChange: (value: SelectUIOption<string>[]) => void }) => <div>
  <output data-testid="selected">{value.map((item) => item.value).join(",")}</output>
  <button onClick={() => onChange(options.filter((option) => option.value === "common"))}>Только общие</button>
  <button onClick={() => onChange(options.filter((option) => option.value !== "common"))}>Только источник</button>
  <button onClick={() => onChange([])}>Снять все</button>
</div> }));
afterEach(cleanup);
it("filters the shared table by selected root sources and supports an empty selection", () => {
  render(<MemoryRouter initialEntries={["/result/synthetic"]}><Routes><Route path="/result/:resultId" element={<AnalysisResultPage />} /></Routes></MemoryRouter>);
  expect(screen.getByText("Общий вывод")).toBeTruthy();
  expect(screen.getByText("Внешний вывод")).toBeTruthy();
  fireEvent.click(screen.getByText("Только общие"));
  expect(screen.getByText("Общий вывод")).toBeTruthy();
  expect(screen.queryByText("Внешний вывод")).toBeNull();
  fireEvent.click(screen.getByText("Только источник"));
  expect(screen.queryByText("Общий вывод")).toBeNull();
  expect(screen.getByText("Внешний вывод")).toBeTruthy();
  fireEvent.click(screen.getByText("Снять все"));
  expect(screen.queryByText("Общий вывод")).toBeNull();
  expect(screen.queryByText("Внешний вывод")).toBeNull();
});
