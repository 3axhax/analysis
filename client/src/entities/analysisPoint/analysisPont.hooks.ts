import { useEffect } from "react";
import { useAppDispatch } from "@shared/store/hooks";
import { getAnalysisPointList } from "./model";
export const useAnalysisPointsLoad = () => {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(getAnalysisPointList()); }, [dispatch]);
};
