import type { WritableDraft } from "immer";
import { AnalysisPointState } from "@entities/analysisPoint";
import { PayloadAction } from "@reduxjs/toolkit";

export const AnalysisPointsReducers = {
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
