import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { SelectUIOption } from "@shared/ui/SelectUI";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList/ui/AnalysisPointDataList";

const source1 = {
  id: 11,
  name: "Документ А",
  rootId: 10,
  rootName: "Библиотека",
  metadata: {},
};
const source2 = {
  id: 12,
  name: "Документ Б",
  rootId: 10,
  rootName: "Библиотека",
  metadata: {},
};
const source3 = {
  id: 13,
  name: "Документ В",
  rootId: 10,
  rootName: "Библиотека",
  metadata: {},
};
const ref = (
  id: number,
  source: typeof source1 | null,
  status: "NORMAL" | "OPTIMUM",
  minValue: string,
  maxValue: string,
) => ({
  id,
  sourceId: source?.id ?? null,
  source,
  status,
  minValue,
  maxValue,
  minValueEqual: true,
  maxValueEqual: true,
});
const match = (
  id: number,
  source: typeof source1 | null,
  status: "NORMAL" | "OPTIMUM" | "LOW" | "HIGH",
) => ({ ...ref(id, source, "NORMAL", "1", "9"), status });
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));
vi.mock("@shared/store/hooks.ts", () => ({
  useAppSelector: () => [
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
      displayValue: "5",
      minValue: 1,
      maxValue: 10,
      pointDataStatus: null,
      displayReferences: [
        ref(1, null, "NORMAL", "1", "10"),
        ref(2, null, "OPTIMUM", "3", "7"),
        ref(3, source1, "NORMAL", "2", "9"),
        ref(4, source1, "OPTIMUM", "3", "8"),
        { ...ref(5, source2, "NORMAL", "1", "9"), minValueEqual: false },
        ref(6, source3, "OPTIMUM", "4", "6"),
      ],
      matchingIntervals: [
        match(1, null, "NORMAL"),
        match(2, null, "OPTIMUM"),
        match(3, source1, "NORMAL"),
        match(4, source1, "OPTIMUM"),
        match(5, source1, "LOW"),
        match(6, source1, "LOW"),
        match(7, source1, "HIGH"),
        match(8, source2, "NORMAL"),
      ],
    },
  ],
}));
vi.mock("react-select", () => ({
  default: ({
    options,
    onChange,
  }: {
    options: SelectUIOption<string>[];
    onChange: (value: SelectUIOption<string>[]) => void;
  }) => (
    <div>
      <button
        onClick={() => onChange(options.filter((o) => o.value === "common"))}
      >
        Только общие
      </button>
      <button
        onClick={() => onChange(options.filter((o) => o.value !== "common"))}
      >
        Только библиотека
      </button>
      <button onClick={() => onChange([])}>Снять все</button>
    </div>
  ),
}));
afterEach(cleanup);

it("renders all references, prioritizes optimum per document, and keeps conflicting statuses", () => {
  render(<AnalysisPointDataList resultId="synthetic" />);
  const table = screen.getByRole("table");
  expect(table.contains(screen.getByText("Только общие"))).toBe(true);
  expect(within(table).getByText(/3 - 7.*Оптимум/)).toBeTruthy();
  expect(
    within(table)
      .getByText(/3 - 7.*Оптимум/)
      .parentElement?.classList.contains("divide-y"),
  ).toBe(true);
  expect(within(table).getByText(/1 - 10.*Норма/)).toBeTruthy();
  expect(within(table).getByText(/> 1, ≤ 9/)).toBeTruthy();
  expect(within(table).getByText(/4 - 6.*Оптимум/)).toBeTruthy();
  const cellText =
    within(table).getByText(/3 - 7.*Оптимум/).parentElement?.textContent ?? "";
  expect(cellText.indexOf("3 - 7")).toBeLessThan(cellText.indexOf("1 - 10"));
  expect(cellText.indexOf("1 - 10")).toBeLessThan(cellText.indexOf("3 - 8"));
  expect(cellText.indexOf("3 - 8")).toBeLessThan(cellText.indexOf("2 - 9"));
  expect(
    within(table).getAllByText("analysisDescriptionConditionStatus.0"),
  ).toHaveLength(1);
  expect(
    within(table).getAllByText("analysisDescriptionConditionStatus.1"),
  ).toHaveLength(1);
  expect(
    within(table).getAllByText("analysisDescriptionConditionStatus.-1"),
  ).toHaveLength(1);
  expect(within(table).getAllByText("Оптимум")).toHaveLength(2);
  expect(
    within(table).getAllByRole("button", {
      name: "Информация об источнике: Документ А",
    }).length,
  ).toBeGreaterThan(0);
});

it("filters the table by root source, including the empty selection", () => {
  render(<AnalysisPointDataList resultId="synthetic" />);
  fireEvent.click(screen.getByText("Только общие"));
  expect(screen.getByText(/1 - 10.*Норма/)).toBeTruthy();
  expect(
    screen.queryByRole("button", {
      name: "Информация об источнике: Документ А",
    }),
  ).toBeNull();
  fireEvent.click(screen.getByText("Только библиотека"));
  expect(screen.queryByText(/1 - 10.*Норма/)).toBeNull();
  expect(
    screen.getAllByRole("button", {
      name: "Информация об источнике: Документ Б",
    }).length,
  ).toBeGreaterThan(0);
  fireEvent.click(screen.getByText("Снять все"));
  expect(screen.queryByText("Показатель")).toBeNull();
});
