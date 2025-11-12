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
} from "./slice";

export {
  SelectAnalysisResultData,
  SelectAnalysisResultDescriptionData,
  SelectAnalysisResultPending,
  SelectAnalysisResultRedirectTo,
  SelectAnalysisResultPrepareDataAge,
  SelectAnalysisResultPrepareDataGender,
  SelectAnalysisResultPointData,
} from "./selectors";

export { sendAnalysisData, getAnalysisResult } from "./extraReducers";

export type {
  PointData,
  ResultDescription,
  PreparePointData,
} from "./types.ts";
