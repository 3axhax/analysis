import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { afterEach, expect, it, vi } from "vitest";
import { AnalysisPointSelectedItem } from "@features/analysisPointList/ui/AnalysisPointSelectedItem";
import { analysisResultSlice, addPointData } from "@entities/analysisResult";
import { sendAnalysisResultFile } from "@entities/analysisResult/model/extraReducers";

vi.mock("@shared/ui", () => ({ SelectUI: ({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) => <select aria-label="Единица" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }));
afterEach(cleanup);
const point = (units: string[]) => ({ id: 1, name: "synthetic", translationRu: "Показатель", units });
function setup(units: string[], existing?: { units: string; value: number; sourceUnitText?: string }) {
  const store = configureStore({ reducer: { analysisResult: analysisResultSlice.reducer, analysisPoint: () => ({ list: [point(units)] }) } });
  if (existing) store.dispatch(addPointData({ name: "synthetic", ...existing }));
  render(<StrictMode><Provider store={store}><AnalysisPointSelectedItem pointId={1} /></Provider></StrictMode>);
  return store;
}
it("uses the only unit immediately when entering a value", async () => {
  const store = setup(["g/l"]);
  expect(screen.queryByText(/Единица не определена/)).toBeNull();
  fireEvent.input(screen.getByLabelText("Показатель"), { target: { value: "20" } });
  await waitFor(() => expect(store.getState().analysisResult.preparedData.pointData.synthetic.units).toBe("g/l"));
});
it("selects the first unit and preserves an explicit alternative across value changes", async () => {
  const store = setup(["g/l", "g/dl"]);
  expect((screen.getByLabelText("Единица") as HTMLSelectElement).value).toBe("g/l");
  fireEvent.change(screen.getByLabelText("Единица"), { target: { value: "g/dl" } });
  fireEvent.input(screen.getByLabelText("Показатель"), { target: { value: "2" } });
  await waitFor(() => expect(store.getState().analysisResult.preparedData.pointData.synthetic.units).toBe("g/dl"));
  fireEvent.input(screen.getByLabelText("Показатель"), { target: { value: "3" } });
  expect(store.getState().analysisResult.preparedData.pointData.synthetic.units).toBe("g/dl");
});
it("keeps a recognized unit and original spelling", async () => {
  const store = setup(["g/l", "g/dl"]);
  act(() => { store.dispatch(sendAnalysisResultFile.fulfilled({ status: "complete", findings: [{ id: 1, name: "synthetic", value: 12, unitId: 16, unit: "g/dl", unitText: "г/дл", confidence: 1, page: 1, warnings: [] }], warnings: [], stats: { pagesTotal: 1, pagesProcessed: 1, pagesOcr: 0, candidates: 1, matched: 1 } }, "synthetic", {} as File)); });
  await waitFor(() => expect((screen.getByLabelText("Единица") as HTMLSelectElement).value).toBe("g/dl"));
  expect(store.getState().analysisResult.preparedData.pointData.synthetic.sourceUnitText).toBe("г/дл");
  expect(screen.queryByText(/Единица выбрана автоматически/)).toBeNull();
});

it("defaults an unrecognized PDF unit and keeps its status visible until a manual choice", async () => {
  const store = setup(["g/l", "g/dl"]);
  act(() => { store.dispatch(sendAnalysisResultFile.fulfilled({ status: "complete", findings: [{ id: 1, name: "synthetic", value: 9, unitId: null, unit: null, confidence: 1, page: 1, warnings: [] }], warnings: [], stats: { pagesTotal: 1, pagesProcessed: 1, pagesOcr: 0, candidates: 1, matched: 1 } }, "synthetic", {} as File)); });
  await waitFor(() => expect(store.getState().analysisResult.preparedData.pointData.synthetic).toMatchObject({ units: "g/l", unitWasDefaulted: true }));
  expect(screen.getByText(/Единица выбрана автоматически/)).toBeTruthy();
  fireEvent.input(screen.getByLabelText("Показатель"), { target: { value: "10" } });
  expect(store.getState().analysisResult.preparedData.pointData.synthetic.unitWasDefaulted).toBe(true);
  fireEvent.change(screen.getByLabelText("Единица"), { target: { value: "g/dl" } });
  expect(store.getState().analysisResult.preparedData.pointData.synthetic).toMatchObject({ units: "g/dl", unitWasDefaulted: false });
});
it("does not invent a unit if none are available", () => {
  const store = setup([], { units: "", value: 1 });
  expect(store.getState().analysisResult.preparedData.pointData.synthetic.units).toBe("");
});
it("defaults a PDF value when its unit catalogue arrives later", async () => {
  const store = configureStore({ reducer: { analysisResult: analysisResultSlice.reducer, analysisPoint: (state = { list: [] as ReturnType<typeof point>[] }, action) => action.type === "synthetic/load" ? { list: [point(["g/l"])] } : state } });
  store.dispatch(addPointData({ name: "synthetic", units: "", value: 8 }));
  render(<StrictMode><Provider store={store}><AnalysisPointSelectedItem pointId={1} /></Provider></StrictMode>);
  expect(store.getState().analysisResult.preparedData.pointData.synthetic.units).toBe("");
  act(() => { store.dispatch({ type: "synthetic/load" }); });
  await waitFor(() => expect(store.getState().analysisResult.preparedData.pointData.synthetic).toMatchObject({ units: "g/l", value: 8, unitWasDefaulted: true }));
});
