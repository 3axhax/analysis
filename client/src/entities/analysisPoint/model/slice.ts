import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { ErrorActionType } from "@shared/lib/types";
import {
  AnalysisPointListItem,
  AnalysisPointState,
  getAnalysisPointList,
} from "@entities/analysisPoint";
import { getFullAnalysisPointList } from "./extraReducers.ts";
import { AnalysisPointsReducers } from "./reducers";

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
  editAnalysisPointId: 0,
};

export const analysisPointSlice = createSlice({
  name: "analysisPoint",
  initialState,
  reducers: AnalysisPointsReducers,
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
  setEditAnalysisPointId,
  resetSelectedPoints,
} = analysisPointSlice.actions;
