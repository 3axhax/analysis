import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import Request from "@shared/transport/RestAPI";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import { SelectUIOption } from "@shared/ui/SelectUI.tsx";

interface AnalysisPointListItem {
  id: number;
  name: string;
  units: string[];
}

interface AnalysisPointState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AnalysisPointListItem[];
  selectedList: number[];
}

const initialState: AnalysisPointState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  selectedList: [],
};

export const getAnalysisPointList = createAsyncThunk(
  "analysisPoint/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (!state.analysisPoint.loaded) {
      try {
        const response = await Request.get("/analysisPoint");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
    }
  },
);

export const analysisPointSlice = createSlice({
  name: "analysisPoint",
  initialState,
  reducers: {
    setSelectedPoint: (
      state: WritableDraft<AnalysisPointState>,
      action: PayloadAction<number[]>,
    ) => {
      state.selectedList = action.payload;
    },
    removeSelectedPoint: (
      state: WritableDraft<AnalysisPointState>,
      action: PayloadAction<number>,
    ) => {
      state.selectedList = state.selectedList.filter(
        (point) => point !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getAnalysisPointList.fulfilled,
        (
          state: WritableDraft<AnalysisPointState>,
          action: PayloadAction<AnalysisPointListItem[]>,
        ) => {
          if (action.payload) {
            state.list = action.payload;
            state.loaded = true;
          }
          state.pending = false;
        },
      )
      .addCase(
        getAnalysisPointList.rejected,
        (state: WritableDraft<AnalysisPointState>, action) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(
        getAnalysisPointList.pending,
        (state: WritableDraft<AnalysisPointState>) => {
          state.pending = true;
          state.error = "";
        },
      );
  },
});

export const { setSelectedPoint, removeSelectedPoint } =
  analysisPointSlice.actions;

const selectAnalysisPointList = (state: RootState) => state.analysisPoint.list;
export const selectAnalysisPointSelectedList = (state: RootState) =>
  state.analysisPoint.selectedList;
export const selectAnalysisPointPending = (state: RootState) =>
  state.analysisPoint.pending;

export const selectAnalysisPointById = (state: RootState, pointId: number) =>
  state.analysisPoint.list.find((point) => point.id === pointId);

export const selectAnalysisPointListForSelect = createSelector(
  [selectAnalysisPointList],
  (agesList): SelectUIOption<number>[] =>
    agesList.map((item) => ({
      value: item.id,
      label: item.name,
    })),
);
