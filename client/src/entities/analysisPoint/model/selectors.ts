import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";
import { SelectUIOption } from "@shared/ui/SelectUI.tsx";
import { AnalysisPointLimit } from "@entities/analysisPoint";

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

export const selectAnalysisPointLimits = createSelector(
  [selectAnalysisPointById],
  (analysisPoint) => {
    if (
      !analysisPoint ||
      !analysisPoint.limits ||
      analysisPoint.limits.length === 0
    )
      return [];
    const sortLimits = [...analysisPoint.limits].sort((a, b) => {
      if (a.age.slice(-1) !== b.age.slice(-1))
        return a.age.slice(-1).localeCompare(b.age.slice(-1));
      if (isNaN(parseInt(a.age))) return 1;
      return parseInt(a.age) > parseInt(b.age) ? 1 : -1;
    });
    return sortLimits.map((limit, i) => {
      const formatedLimit: AnalysisPointLimit = { ...limit };
      if (sortLimits[i + 1] && sortLimits[i + 1].age === limit.age) {
        formatedLimit.skipAge = true;
        if (
          sortLimits[i + 1].maxValue === limit.maxValue &&
          sortLimits[i + 1].minValue === limit.minValue
        ) {
          formatedLimit.skipGender = true;
        }
      }
      return formatedLimit;
    });
  },
);

export const selectAnalysisPointsEditAnalysisPointId = (state: RootState) =>
  state.analysisPoint.editAnalysisPointId;

export const selectAnalysisPointsEditAnalysisPoint = createSelector(
  [selectAnalysisPointList, selectAnalysisPointsEditAnalysisPointId],
  (list, editableId) =>
    editableId > 0 ? list.find((point) => point.id === editableId) : undefined,
);
