import { useAppDispatch } from "@shared/store/hooks.ts";
import { useEffect } from "react";
import { getGenderList } from "@entities/gender/model";

export const useGenderLoad = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getGenderList());
  }, [dispatch]);
};
