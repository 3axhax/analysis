import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList/ui/AnalysisPointDataList";
import { AnalysisPointDataListStatus } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus";
import { StatusValue } from "@entities/analysisResult/model/types";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }) }));
vi.mock("@shared/store/hooks.ts", () => ({ useAppSelector: () => [{
  id: 1, point: { id: 1, name: "synthetic", translationRu: "Показатель", pointHintRu: null },
  pointUnit: { id: 1, name: "g/l" }, value: 4, displayValue: "4", minValue: 1, maxValue: 3, pointDataStatus: null,
  matchingIntervals: [
    { id: 1, minValue: null, maxValue: "3", minValueEqual: null, maxValueEqual: true, unit: "g/l", sourceName: "Источник" },
    { id: 2, minValue: "1", maxValue: null, minValueEqual: false, maxValueEqual: null, unit: "g/l", sourceName: null },
  ],
}] }));
afterEach(cleanup);

it("shows the common reference with a dash, even outside its bounds", () => {
  render(<AnalysisPointDataList resultId="synthetic" />);
  expect(screen.getByText(/1 - 3/)).toBeTruthy();
  expect(screen.queryByText(/Источник/)).toBeNull();
  expect(screen.queryByText(/x ≤/)).toBeNull();
  expect(screen.getByText(/^4/)).toBeTruthy();
  expect(screen.queryByText("Нет интерпретации")).toBeNull();
});

it("supports the optimum status label", () => {
  render(<AnalysisPointDataListStatus status={StatusValue.OPTIMUM} />);
  expect(screen.getByText("Оптимум")).toBeTruthy();
});
