import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import {
  AnalysisResult,
  AnalysisResultState,
  PreparedData,
} from "@entities/analysisResult/model/types.ts";
import { AnalysisResultReducers } from "@entities/analysisResult/model/reducers.ts";
import type { WritableDraft } from "immer";
import {
  getAnalysisResult,
  sendAnalysisData,
} from "@entities/analysisResult/model/extraReducers.ts";

export const initialPrepareData: PreparedData = {
  gender: "m",
  age: "",
  pointData: {},
};

const initialState: AnalysisResultState = {
  pending: false,
  error: "",
  preparedData: initialPrepareData,
  results: {},
};

export const analysisResultSlice = createSlice({
  name: "analysisResult",
  initialState,
  reducers: AnalysisResultReducers,
  extraReducers: (builder) => {
    builder
      .addCase(
        sendAnalysisData.fulfilled,
        (
          state: WritableDraft<AnalysisResultState>,
          action: PayloadAction<AnalysisResult>,
        ) => {
          if (action.payload.resultId) {
            state.redirectTo = `/result/${action.payload.resultId}`;
          }
        },
      )
      .addCase(
        sendAnalysisData.rejected,
        (state: WritableDraft<AnalysisResultState>, action) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(
        sendAnalysisData.pending,
        (state: WritableDraft<AnalysisResultState>) => {
          state.error = "";
        },
      )
      .addCase(
        getAnalysisResult.fulfilled,
        (
          state: WritableDraft<AnalysisResultState>,
          action: PayloadAction<AnalysisResult>,
        ) => {
          if (action?.payload?.resultId) {
            state.results[action.payload.resultId] = action.payload;
          }
        },
      )
      .addCase(
        getAnalysisResult.rejected,
        (state: WritableDraft<AnalysisResultState>, action) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(
        getAnalysisResult.pending,
        (state: WritableDraft<AnalysisResultState>) => {
          state.error = "";
        },
      );
  },
});

export const {
  setPrepareDataGender,
  setPrepareDataAge,
  resetPrepareData,
  addPointData,
  removePointData,
  clearAllPointData,
  setPending,
  clearRedirect,
} = analysisResultSlice.actions;

export const SelectAnalysisResultPending = (state: RootState) =>
  state.analysisResult.pending;

export const SelectAnalysisResultRedirectTo = (state: RootState) =>
  state.analysisResult.redirectTo;

export const SelectAnalysisResultData = (state: RootState, resultId: string) =>
  state.analysisResult.results[resultId];

export const SelectAnalysisResultDescriptionData = (
  state: RootState,
  resultId: string,
) => state.analysisResult.results[resultId].descriptions;
