import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AnalysisDescriptionList } from "@widgets/analysisDescriptionList/ui/AnalysisDescriptionList";
import { StatusValue, type ResultDescription, type SourceDescriptionGroup } from "@entities/analysisResult/model/types";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(cleanup);

const condition = (id: number, name: string, status: StatusValue) => ({ id, analysisPoint: { id, name }, status });
const common: ResultDescription = { id: 1, description_ru: "Общее описание", analysisResultDescriptionConditions: [condition(1, "common", StatusValue.HIGH)] };
const group: SourceDescriptionGroup = {
  source: { id: 2, name: "Публикация", rootId: 1, rootName: "Библиотека", metadata: { title: "Название", authors: "Автор", year: 2018, url: "https://example.org/article", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", translation: "Адаптировано", underlyingSource: "Первичная публикация", underlyingSourceUrl: "https://example.org/original" } },
  inheritedPointIds: [3],
  descriptions: [{ id: 2, description_ru: "Описание источника", analysisResultDescriptionConditions: [condition(2, "external", StatusValue.LOW), condition(3, "inherited", StatusValue.NORMAL)] }],
};

it("combines and orders descriptions, marks only source-specific parameters and displays statuses", () => {
  render(<AnalysisDescriptionList descriptions={[common]} sourceGroups={[group]} />);
  const rows = screen.getAllByRole("row");
  expect(within(rows[1]).getByText("Описание источника")).toBeTruthy();
  expect(within(rows[2]).getByText("Общее описание")).toBeTruthy();
  expect(within(rows[1]).getByText("analysisDescriptionConditionStatus.0")).toBeTruthy();
  expect(within(rows[1]).getByText("analysisDescriptionConditionStatus.-1")).toBeTruthy();
  expect(within(rows[1]).getAllByRole("button", { name: /Информация об источнике/ })).toHaveLength(1);
});

it("shows a short hover tooltip, pins full details and closes on outside click", () => {
  render(<AnalysisDescriptionList descriptions={[]} sourceGroups={[group]} />);
  const button = screen.getByRole("button", { name: /Информация об источнике/ });
  fireEvent.mouseEnter(button.parentElement!);
  expect(screen.getByRole("tooltip").textContent).toBe("Источник: Публикация");
  fireEvent.click(button);
  expect(screen.getByRole("dialog").textContent).toContain("Автор, 2018");
  expect(screen.getByRole("link", { name: "CC BY 4.0" }).getAttribute("href")).toContain("creativecommons.org");
  expect(screen.getByRole("link", { name: "Первичная публикация" }).getAttribute("href")).toBe("https://example.org/original");
  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("tooltip")).toBeNull();
});


it("does not pin source details after three seconds of continuous icon hover", () => {
  vi.useFakeTimers();
  try {
    render(<AnalysisDescriptionList descriptions={[]} sourceGroups={[group]} />);
    const button = screen.getByRole("button", { name: /Информация об источнике/ });
    fireEvent.mouseEnter(button);
    act(() => { vi.advanceTimersByTime(2999); });
    expect(screen.queryByRole("dialog")).toBeNull();
    act(() => { vi.advanceTimersByTime(1); });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(button);
    expect(screen.getByRole("dialog").textContent).toContain("Автор, 2018");
    fireEvent.mouseLeave(button);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  } finally { vi.useRealTimers(); }
});

it("shows a source link in the description and hides the service-status sentence", () => {
  const testGroup = { ...group, descriptions: [{ ...group.descriptions[0], description_ru: "Полезное описание. Статусы показателей определены по общим нормативам сервиса." }] };
  render(<AnalysisDescriptionList descriptions={[]} sourceGroups={[testGroup]} />);
  const row = screen.getAllByRole("row")[1];
  expect(within(row).getByText("Полезное описание.").closest("li")).toBeTruthy();
  expect(within(row).queryByText(/Статусы показателей определены/)).toBeNull();
  const button = within(row).getByRole("button", { name: /Источник описания/ });
  fireEvent.mouseEnter(button.parentElement!);
  expect(screen.getByRole("tooltip").textContent).toBe("Источник: Публикация");
  fireEvent.click(button);
  expect(screen.getByRole("dialog").textContent).toContain("Автор, 2018");
  fireEvent.pointerDown(document.body);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("cancels hover activation after leaving or clicking the icon", () => {
  vi.useFakeTimers();
  try {
    render(<AnalysisDescriptionList descriptions={[]} sourceGroups={[group]} />);
    const button = screen.getByRole("button", { name: /Информация об источнике/ });
    fireEvent.mouseEnter(button);
    act(() => { vi.advanceTimersByTime(2000); });
    fireEvent.mouseLeave(button);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.mouseEnter(button);
    fireEvent.click(button);
    fireEvent.click(button);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(screen.queryByRole("dialog")).toBeNull();
  } finally { vi.useRealTimers(); }
});
