import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import type { SelectUIOption } from "@shared/ui/SelectUI";
import { AnalysisResultPage } from "@pages/analysisResult/AnalysisResultPage";

const source = {
  id: 2,
  name: "Статья",
  rootId: 1,
  rootName: "Библиотека",
  metadata: {},
};
const sample = {
  resultId: "synthetic",
  result: {
    Gender: { name: "m" },
    ageInDays: 10000,
    analysisResultPointData: [
      {
        id: 1,
        point: {
          id: 1,
          name: "synthetic",
          translationRu: "Показатель",
          pointHintRu: null,
        },
        pointUnit: { id: 1, name: "g/l" },
        value: 5,
        minValue: 1,
        maxValue: 10,
        pointDataStatus: null,
        displayReferences: [
          {
            id: 1,
            sourceId: null,
            source: null,
            status: "NORMAL",
            minValue: "1",
            maxValue: "10",
            minValueEqual: true,
            maxValueEqual: true,
          },
          {
            id: 2,
            sourceId: 2,
            source,
            status: "NORMAL",
            minValue: "2",
            maxValue: "9",
            minValueEqual: true,
            maxValueEqual: true,
          },
        ],
        matchingIntervals: [{ id: 3, sourceId: 2, source, status: "HIGH" }],
      },
    ],
  },
  descriptions: [],
  sourceDescriptions: [
    {
      source,
      inheritedPointIds: [],
      descriptions: [
        {
          id: 5,
          description_ru: "Внешний вывод",
          analysisResultDescriptionConditions: [
            { id: 6, analysisPoint: { id: 1, name: "synthetic" }, status: "1" },
          ],
        },
      ],
    },
  ],
};
vi.mock("@shared/store/hooks.ts", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ analysisResult: { results: { synthetic: sample } } }),
}));
vi.mock("@entities/analysisResult/analysisResults.hooks.ts", () => ({
  useAnalysisResultsLoad: () => {},
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("react-select", () => ({
  default: ({
    inputId,
    options,
    onChange,
  }: {
    inputId: string;
    options: SelectUIOption<string>[];
    onChange: (value: SelectUIOption<string>[]) => void;
  }) => (
    <div>
      <button
        onClick={() => onChange(options.filter((o) => o.value === "common"))}
      >
        {inputId}-общие
      </button>
      <button onClick={() => onChange([])}>{inputId}-пусто</button>
    </div>
  ),
}));
afterEach(cleanup);

it("keeps the table and interpretation source selections independent", () => {
  render(
    <MemoryRouter initialEntries={["/result/synthetic"]}>
      <Routes>
        <Route path="/result/:resultId" element={<AnalysisResultPage />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByText("Внешний вывод")).toBeTruthy();
  expect(screen.getByText(/2 - 9/)).toBeTruthy();
  fireEvent.click(screen.getByText("reference-sources-общие"));
  expect(screen.queryByText(/2 - 9/)).toBeNull();
  expect(screen.getByText("Внешний вывод")).toBeTruthy();
  fireEvent.click(screen.getByText("result-sources-пусто"));
  expect(screen.queryByText("Внешний вывод")).toBeNull();
  expect(screen.getByText(/1 - 10/)).toBeTruthy();
});
