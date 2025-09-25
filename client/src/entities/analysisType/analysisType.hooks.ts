import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getAnalysisTypeList } from "@entities/analysisType/model/slice.ts";

export const useAnalysisTypeLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAnalysisTypeList());
  }, [dispatch]);
};
