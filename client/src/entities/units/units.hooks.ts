import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getUnitsList } from "@entities/units";

export const useUnitsLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getUnitsList());
  }, [dispatch]);
};
