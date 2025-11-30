import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getDescriptionsListWithTranslate } from "@entities/descriptions";
import { getDescriptionsList } from "@entities/descriptions/model";

export const useDescriptionsLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getDescriptionsList());
  }, [dispatch]);
};

export const useDescriptionsWithTranslateLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getDescriptionsListWithTranslate());
  }, [dispatch]);
};
