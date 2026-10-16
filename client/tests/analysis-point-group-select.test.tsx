import { StrictMode, useEffect } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import {
  analysisResultSlice,
  resetSelectedPoints,
  setSelectedPoint,
} from "@entities/analysisResult";
import {
  analysisTypeSlice,
  getAnalysisTypeList,
} from "@entities/analysisType/model/slice";
import { AnalysisPointGroupSelect } from "@features/analysisPointList/ui/AnalysisPointGroupSelect";
import type { SelectMultiUIOption, SelectUIOption } from "@shared/ui/SelectUI";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("react-select", () => ({
  default: ({
    value,
    options,
    onChange,
    formatGroupLabel,
  }: {
    value: SelectUIOption<number>[];
    options: SelectMultiUIOption<number>[];
    onChange: (options: SelectUIOption<number>[]) => void;
    formatGroupLabel: (group: SelectMultiUIOption<number>) => React.ReactNode;
  }) => (
    <div>
      <output data-testid="selection">
        {value.map((option) => option.value).join(",")}
      </output>
      <button onClick={() => onChange([options[0].options[1]])}>
        Choose second
      </button>
      {options.map((group) => (
        <div key={group.label}>{formatGroupLabel(group)}</div>
      ))}
    </div>
  ),
}));

afterEach(cleanup);

const catalog = [
  {
    id: 1,
    name: "synthetic",
    description: "",
    analysisPoint: [
      {
        id: 101,
        name: "first",
        translationRu: "First",
        translationEn: "First",
      },
      {
        id: 102,
        name: "second",
        translationRu: "Second",
        translationEn: "Second",
      },
    ],
  },
];

function setup(withCatalog = true) {
  let actions = 0;
  const store = configureStore({
    reducer: {
      analysisResult: analysisResultSlice.reducer,
      analysisType: analysisTypeSlice.reducer,
      analysisPoint: () => ({ list: [] }),
    },
    middleware: (getDefault) =>
      getDefault().concat(() => (next) => (action) => {
        // Fail deterministically instead of hanging on the original passive-effect loop.
        if (++actions > 30) throw new Error("Repeated dispatch cycle");
        return next(action);
      }),
  });
  if (withCatalog)
    store.dispatch(getAnalysisTypeList.fulfilled(catalog, "synthetic"));
  return store;
}

it("returns from a populated result to the reset home form without an update cycle", () => {
  const store = setup();
  store.dispatch(setSelectedPoint([101]));
  function Home() {
    useEffect(() => {
      store.dispatch(resetSelectedPoints());
    }, []);
    return <AnalysisPointGroupSelect />;
  }
  render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/result/synthetic"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/result/:id" element={<Link to="/">Home</Link>} />
            <Route path="/" element={<Home />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </StrictMode>,
  );
  fireEvent.click(screen.getByText("Home"));
  expect(store.getState().analysisResult.selectedList).toEqual([]);
  expect(screen.getByTestId("selection").textContent).toBe("");
});

it("reflects external same-length replacements, removals and manual selection", () => {
  const store = setup();
  store.dispatch(setSelectedPoint([101]));
  render(
    <Provider store={store}>
      <AnalysisPointGroupSelect />
    </Provider>,
  );
  expect(screen.getByTestId("selection").textContent).toBe("101");
  act(() => {
    store.dispatch(setSelectedPoint([102]));
  });
  expect(screen.getByTestId("selection").textContent).toBe("102");
  act(() => {
    store.dispatch(resetSelectedPoints());
  });
  expect(screen.getByTestId("selection").textContent).toBe("");
  fireEvent.click(screen.getByText("Choose second"));
  expect(store.getState().analysisResult.selectedList).toEqual([102]);
  fireEvent.click(screen.getByText("analysisType.synthetic"));
  expect(store.getState().analysisResult.selectedList).toEqual([102, 101]);
  fireEvent.click(screen.getByText("analysisType.synthetic"));
  expect(store.getState().analysisResult.selectedList).toEqual([102, 101]);
});

it("keeps selected IDs while the catalog is loading and resolves them afterwards", () => {
  const store = setup(false);
  store.dispatch(setSelectedPoint([101]));
  render(
    <Provider store={store}>
      <AnalysisPointGroupSelect />
    </Provider>,
  );
  expect(store.getState().analysisResult.selectedList).toEqual([101]);
  act(() => {
    store.dispatch(getAnalysisTypeList.fulfilled(catalog, "synthetic"));
  });
  expect(screen.getByTestId("selection").textContent).toBe("101");
});
