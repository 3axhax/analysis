export {
  analysisResultSlice,
  setPending,
  setPrepareDataGender,
  setPrepareDataAge,
  resetPrepareData,
  addPointData,
  removePointData,
  clearAllPointData,
  clearRedirect,
  setSelectedPoint,
  removeSelectedPoint,
  resetSelectedPoints,
} from "./slice";

export {
  SelectAnalysisResultData,
  SelectAnalysisResultDescriptionData,
  SelectAnalysisResultPending,
  SelectAnalysisResultRedirectTo,
  SelectAnalysisResultPrepareDataAge,
  SelectAnalysisResultPrepareDataGender,
  SelectAnalysisResultPointData,
  SelectAnalysisResultError,
  SelectAnalysisResultSelectedList,
  SelectAnalysisResultPrepareDataPointDataByName,
} from "./selectors";

export {
  sendAnalysisData,
  getAnalysisResult,
  sendAnalysisResultFile,
} from "./extraReducers";

export type {
  PointData,
  ResultDescription,
  PreparePointData,
} from "./types.ts";
