import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getUnitsListWithTranslate } from "@entities/units";
import { getUnitsList } from "@entities/units/model";

export const useUnitsLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUnitsList());
  }, [dispatch]);
};

export const useUnitsWithTranslateLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUnitsListWithTranslate());
  }, [dispatch]);
};
