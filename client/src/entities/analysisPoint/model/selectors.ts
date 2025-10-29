import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";
import { SelectUIOption } from "@shared/ui/SelectUI.tsx";

export const selectAnalysisPointList = (state: RootState) =>
  state.analysisPoint.list;
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

export const selectAnalysisPointsError = (state: RootState) =>
  state.analysisPoint.error;

export const selectAnalysisPointsCurrentPage = (state: RootState) =>
  state.analysisPoint.currentPage;

export const selectAnalysisPointsTotalPage = (state: RootState) =>
  Math.ceil(
    state.analysisPoint.totalRecord / state.analysisPoint.recordPerPage,
  );
