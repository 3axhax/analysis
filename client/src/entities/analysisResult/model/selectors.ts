import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";

export const SelectAnalysisResultPending = (state: RootState) =>
  state.analysisResult.pending;

export const SelectAnalysisResultError = (state: RootState) =>
  state.analysisResult.error;

export const SelectAnalysisResultSelectedList = (state: RootState) =>
  state.analysisResult.selectedList;

export const SelectAnalysisResultRedirectTo = (state: RootState) =>
  state.analysisResult.redirectTo;

export const SelectAnalysisResultPrepareDataAgeInDays = (state: RootState) =>
  state.analysisResult.preparedData.ageInDays;

export const SelectAnalysisResultPrepareDataGender = (state: RootState) =>
  state.analysisResult.preparedData.gender;

export const SelectAnalysisResultPrepareDataPointDataByName = (
  state: RootState,
  pointName: string,
) => state.analysisResult.preparedData.pointData[pointName];

export const SelectAnalysisResultData = (state: RootState, resultId: string) =>
  state.analysisResult.results[resultId];

export const SelectAnalysisResultDescriptionData = (
  state: RootState,
  resultId: string,
) => state.analysisResult.results[resultId].descriptions;

const AnalysisResultPointData = (state: RootState, resultId: string) =>
  state.analysisResult.results[resultId].result.analysisResultPointData;

export const SelectAnalysisResultPointData = createSelector(
  [AnalysisResultPointData],
  (pointData) => {
    return [...pointData].sort((a, b) =>
      a.point.name.localeCompare(b.point.name),
    );
  },
);
