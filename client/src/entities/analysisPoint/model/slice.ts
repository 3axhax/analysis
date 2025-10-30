import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { ErrorActionType } from "@shared/lib/types/errorActionType.ts";
import {
  AnalysisPointListItem,
  AnalysisPointState,
  getAnalysisPointList,
} from "@entities/analysisPoint";
import { getFullAnalysisPointList } from "@entities/analysisPoint/model/extraReducers.ts";

const initialState: AnalysisPointState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  selectedList: [],
  currentPage: 1,
  totalRecord: 0,
  recordPerPage: 20,
  filters: {},
};

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
    setPending: (
      state: WritableDraft<AnalysisPointState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setCurrentPage: (
      state: WritableDraft<AnalysisPointState>,
      action: PayloadAction<number>,
    ) => {
      if (
        action.payload > 0 &&
        action.payload <= Math.ceil(state.totalRecord / state.recordPerPage)
      ) {
        state.currentPage = action.payload;
      }
    },
    resetError: (state: WritableDraft<AnalysisPointState>) => {
      state.error = "";
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
        getFullAnalysisPointList.fulfilled,
        (
          state: WritableDraft<AnalysisPointState>,
          action: PayloadAction<{
            totalRecord: number;
            currentPage: number;
            rows: AnalysisPointListItem[];
          }>,
        ) => {
          if (action.payload) {
            state.list = action.payload.rows;
            state.totalRecord = action.payload.totalRecord;
            state.loaded = true;
          }
          state.pending = false;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("analysisPoint"),
        (state: WritableDraft<AnalysisPointState>, action: ErrorActionType) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("analysisPoint"),
        (state: WritableDraft<AnalysisPointState>) => {
          state.error = "";
        },
      );
  },
});

export const {
  setSelectedPoint,
  removeSelectedPoint,
  setPending,
  setCurrentPage,
  resetError,
} = analysisPointSlice.actions;
