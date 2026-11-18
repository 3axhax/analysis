import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@shared/store";
import type { SelectUIOption } from "@shared/ui";
export const selectAnalysisPointList = (state: RootState) => state.analysisPoint.list;
export const selectAnalysisPointPending = (state: RootState) => state.analysisPoint.pending;
export const selectAnalysisPointById = (state: RootState, pointId: number) => state.analysisPoint.list.find((point) => point.id === pointId);
export const selectAnalysisPointListForSelect = createSelector([selectAnalysisPointList], (list): SelectUIOption<number>[] => list.map((item) => ({ value: item.id, label: item.translationRu })));
