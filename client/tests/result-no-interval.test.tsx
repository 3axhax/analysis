import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList/ui/AnalysisPointDataList";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@shared/store/hooks.ts", () => ({
  useAppSelector: () => [
    {
      id: 1,
      point: { translationRu: "Показатель", pointHintRu: null },
      pointUnit: { name: "g/l" },
      value: 5,
      minValue: null,
      maxValue: null,
      pointDataStatus: null,
      displayReferences: [],
      matchingIntervals: [],
    },
  ],
}));
afterEach(cleanup);
it("keeps the measured value visible when no interval applies", () => {
  render(<AnalysisPointDataList resultId="synthetic" />);
  expect(screen.getByText("Показатель")).toBeTruthy();
  expect(screen.getByText(/^5/)).toBeTruthy();
  expect(screen.queryByText("Нет интерпретации")).toBeNull();
});
