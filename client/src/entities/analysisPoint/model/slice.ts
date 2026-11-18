import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getAnalysisPointList } from "./extraReducers";
import type { AnalysisPointListItem, AnalysisPointState } from "./types";

const initialState: AnalysisPointState = { loaded: false, pending: false, error: "", list: [] };
export const analysisPointSlice = createSlice({
  name: "analysisPoint",
  initialState,
  reducers: { setPending: (state, action: PayloadAction<boolean>) => { state.pending = action.payload; } },
  extraReducers: (builder) => {
    builder.addCase(getAnalysisPointList.fulfilled, (state, action: PayloadAction<AnalysisPointListItem[] | undefined>) => {
      if (action.payload) { state.list = action.payload; state.loaded = true; }
      state.pending = false;
    });
    builder.addCase(getAnalysisPointList.rejected, (state, action) => { state.error = action.error.message ?? ""; state.pending = false; });
  },
});
export const { setPending } = analysisPointSlice.actions;
