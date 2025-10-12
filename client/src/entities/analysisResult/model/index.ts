export {
  analysisResultSlice,
  setPending,
  setPrepareDataGender,
  setPrepareDataAge,
  resetPrepareData,
  addPointData,
  removePointData,
  clearAllPointData,
  SelectAnalysisResultData,
  SelectAnalysisResultDescriptionData,
  clearRedirect,
} from "./slice";

export { sendAnalysisData, getAnalysisResult } from "./extraReducers";

export type {
  PointData,
  ResultDescription,
  PreparePointData,
} from "./types.ts";
