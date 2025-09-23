import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getAgesList } from "@entities/ages/model";

export const useAgesLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAgesList());
  }, [dispatch]);
};
