import type { WritableDraft } from "immer";
import {
  AnalysisResultState,
  PointData,
} from "@entities/analysisResult/model/types.ts";
import { PayloadAction } from "@reduxjs/toolkit";
import { GenderType } from "@entities/gender";
import { initialPrepareData } from "@entities/analysisResult/model/slice.ts";

export const AnalysisResultReducers = {
  setPending: (
    state: WritableDraft<AnalysisResultState>,
    action: PayloadAction<boolean>,
  ) => {
    state.pending = action.payload;
  },
  resetPrepareData: (state: WritableDraft<AnalysisResultState>) => {
    state.preparedData = initialPrepareData;
  },
  setPrepareDataGender: (
    state: WritableDraft<AnalysisResultState>,
    action: PayloadAction<GenderType>,
  ) => {
    state.preparedData.gender = action.payload;
  },
  setPrepareDataAge: (
    state: WritableDraft<AnalysisResultState>,
    action: PayloadAction<string>,
  ) => {
    state.preparedData.age = action.payload;
  },
  addPointData: (
    state: WritableDraft<AnalysisResultState>,
    action: PayloadAction<PointData>,
  ) => {
    state.preparedData.pointData[action.payload.name] = action.payload;
  },
  removePointData: (
    state: WritableDraft<AnalysisResultState>,
    action: PayloadAction<string>,
  ) => {
    if (state.preparedData.pointData[action.payload]) {
      delete state.preparedData.pointData[action.payload];
    }
  },
  clearAllPointData: (state: WritableDraft<AnalysisResultState>) => {
    state.preparedData.pointData = {};
  },
};
