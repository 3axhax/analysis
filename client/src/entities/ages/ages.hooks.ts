import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getAgesList, getAgesListWithTranslate } from "@entities/ages";

export const useAgesLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAgesList());
  }, [dispatch]);
};

export const useAgesWithTranslateLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAgesListWithTranslate());
  }, [dispatch]);
};
