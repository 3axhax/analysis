import { RootState } from "@shared/store";

export const SelectAnalysisResultPending = (state: RootState) =>
  state.analysisResult.pending;

export const SelectAnalysisResultRedirectTo = (state: RootState) =>
  state.analysisResult.redirectTo;

export const SelectAnalysisResultPrepareDataAge = (state: RootState) =>
  state.analysisResult.preparedData.age;

export const SelectAnalysisResultPrepareDataGender = (state: RootState) =>
  state.analysisResult.preparedData.gender;

export const SelectAnalysisResultData = (state: RootState, resultId: string) =>
  state.analysisResult.results[resultId];

export const SelectAnalysisResultDescriptionData = (
  state: RootState,
  resultId: string,
) => state.analysisResult.results[resultId].descriptions;

export const SelectAnalysisResultPointData = (
  state: RootState,
  resultId: string,
) => state.analysisResult.results[resultId].result.analysisResultPointData;
