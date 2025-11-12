import type { WritableDraft } from "immer";
import { AnalysisPointState } from "@entities/analysisPoint";
import { PayloadAction } from "@reduxjs/toolkit";

export const AnalysisPointsReducers = {
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
  setEditAnalysisPointId: (
    state: WritableDraft<AnalysisPointState>,
    action: PayloadAction<number | undefined>,
  ) => {
    state.editAnalysisPointId =
      action.payload && action.payload > 0 ? action.payload : 0;
  },
};
