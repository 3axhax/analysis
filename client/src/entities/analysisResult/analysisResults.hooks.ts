import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getAnalysisResult } from "@entities/analysisResult/model";

export const useAnalysisResultsLoad = (resultId: string) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAnalysisResult(resultId));
  }, [dispatch, resultId]);
};
