import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import {
  getAnalysisPointList,
  getFullAnalysisPointList,
} from "@entities/analysisPoint";

export const useAnalysisPointsLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAnalysisPointList());
  }, [dispatch]);
};

export const useFullAnalysisPointsLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getFullAnalysisPointList());
  }, [dispatch]);
};
