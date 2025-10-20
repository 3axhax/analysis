import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getTranslationsList } from "@entities/translations";

export const useTranslationsLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getTranslationsList());
  }, [dispatch]);
};
