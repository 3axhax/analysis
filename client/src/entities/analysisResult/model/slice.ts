import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AnalysisParsingFileResult,
  AnalysisResult,
  AnalysisResultState,
  PreparedData,
} from "@entities/analysisResult/model/types.ts";
import { AnalysisResultReducers } from "@entities/analysisResult/model/reducers.ts";
import type { WritableDraft } from "immer";
import {
  getAnalysisResult,
  sendAnalysisData,
  sendAnalysisResultFile,
} from "@entities/analysisResult/model/extraReducers.ts";
import { ErrorActionType } from "@shared/lib/types";

export const initialPrepareData: PreparedData = {
  gender: "m",
  age: "",
  pointData: {},
};

const initialState: AnalysisResultState = {
  pending: false,
  error: "",
  selectedList: [],
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
        sendAnalysisResultFile.fulfilled,
        (
          state: WritableDraft<AnalysisResultState>,
          action: PayloadAction<AnalysisParsingFileResult>,
        ) => {
          state.selectedList = action.payload.findingPoints.map(
            (point) => point.id,
          );
          state.preparedData.pointData = action.payload.findingPoints.reduce(
            (acc, point) => {
              acc[point.name] = {
                name: point.name,
                value: point.value,
                units: "",
              };
              return acc;
            },
            {} as PreparedData["pointData"],
          );
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("analysisResult"),
        (
          state: WritableDraft<AnalysisResultState>,
          action: ErrorActionType,
        ) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("analysisResult"),
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
  setSelectedPoint,
  removeSelectedPoint,
  resetSelectedPoints,
} = analysisResultSlice.actions;
