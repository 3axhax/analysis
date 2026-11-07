import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList/ui/AnalysisPointDataList";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@shared/store/hooks.ts", () => ({ useAppSelector: () => [{
  id: 1, point: { id: 1, name: "synthetic", translationRu: "Показатель", pointHintRu: "Описание показателя" },
  pointUnit: { id: 16, name: "g/dl" }, value: 14, minValue: 12, maxValue: 17, pointDataStatus: "-1",
  calculation: { unitId: 2, unit: "g/l", value: "140" },
}] }));
afterEach(cleanup);

it("uses the same interactive tooltip for the calculated unit and point hint", () => {
  render(<AnalysisPointDataList resultId="synthetic" />);
  const valueButton = screen.getByRole("button", { name: "Значение в расчётных единицах" });
  const hintButton = screen.getByRole("button", { name: "Информация о показателе" });
  expect(valueButton.querySelector("svg")?.outerHTML).toBe(hintButton.querySelector("svg")?.outerHTML);
  fireEvent.mouseEnter(valueButton.parentElement!);
  expect(screen.getByRole("tooltip").textContent).toContain("Для расчёта:");
  fireEvent.click(valueButton);
  fireEvent.mouseLeave(valueButton.parentElement!);
  expect(screen.getByRole("dialog").textContent).toContain("Для расчёта:");
  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(hintButton);
  expect(screen.getByRole("dialog").textContent).toBe("Описание показателя");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});


it("does not automatically pin a non-source tooltip", () => {
  vi.useFakeTimers();
  try {
    render(<AnalysisPointDataList resultId="synthetic" />);
    const button = screen.getByRole("button", { name: "Значение в расчётных единицах" });
    fireEvent.mouseEnter(button);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.queryByRole("dialog")).toBeNull();
  } finally { vi.useRealTimers(); }
});
