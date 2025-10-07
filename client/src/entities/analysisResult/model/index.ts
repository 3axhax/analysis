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
  clearRedirect,
} from "./slice";

export { sendAnalysisData, getAnalysisResult } from "./extraReducers";
