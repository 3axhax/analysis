import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getAnalysisPointList } from "@entities/analysisPoint";

export const useAnalysisPointLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAnalysisPointList());
  }, [dispatch]);
};
