import type { WritableDraft } from "immer";
import { AnalysisPointState } from "@entities/analysisPoint";
import { PayloadAction } from "@reduxjs/toolkit";

export const AnalysisPointsReducers = {
  resetAdminView: (state: WritableDraft<AnalysisPointState>) => {
    state.adminRequestId = null;
    state.pending = false;
    state.currentPage = 1;
    state.filters = {};
    state.editAnalysisPointId = 0;
    state.error = "";
    state.loaded = false;
    state.list = [];
    state.totalRecord = 0;
  },
  setPending: (
    state: WritableDraft<AnalysisPointState>,
    action: PayloadAction<boolean>,
  ) => {
    state.pending = action.payload;
  },
  setLoaded: (
    state: WritableDraft<AnalysisPointState>,
    action: PayloadAction<boolean>,
  ) => {
    state.loaded = action.payload;
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
  setFilters: (
    state: WritableDraft<AnalysisPointState>,
    action: PayloadAction<Record<string, string>>,
  ) => {
    state.filters = action.payload;
  },
};
