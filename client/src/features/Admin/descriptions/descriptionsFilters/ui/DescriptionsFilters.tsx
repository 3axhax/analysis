import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";
import React, { useState } from "react";
import { useAppDispatch } from "@shared/store/hooks.ts";
import {
  getDescriptionsListWithTranslate,
  setFilters,
} from "@entities/descriptions";
import { AnalysisPointsSelector } from "@features/analysisPointsSelector";

const initialFormValue = {
  analysisPoint: 0,
};

export const DescriptionsFilters = () => {
  const dispatch = useAppDispatch();

  const [formValue, setFormValue] = useState(initialFormValue);

  const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(getDescriptionsListWithTranslate());
  };

  const handlerInput = ({ name, value }: { name: string; value: number }) => {
    const filtersValues = { ...formValue, [name]: value };
    setFormValue(filtersValues);
    dispatch(setFilters(filtersValues));
  };

  const handlerClear = () => {
    setFormValue(initialFormValue);
    dispatch(setFilters({}));
    dispatch(getDescriptionsListWithTranslate());
  };

  return (
    <form
      className={
        "flex items-center justify-center space-x-2 m-auto max-w-[90%] mb-5"
      }
      onSubmit={handlerSubmit}
    >
      <AnalysisPointsSelector
        analysisPoint={formValue.analysisPoint}
        setAnalysisPoint={(value) =>
          handlerInput({
            name: "analysisPoint",
            value: value,
          })
        }
      />
      <button className={"btn p-2"}>
        <MagnifyingGlassIcon
          className={"h-5 w-5 text-white group-hover:text-orange-300"}
        />
      </button>
      <button type={"reset"} className={"btn p-2"} onClick={handlerClear}>
        <XMarkIcon
          className={"h-5 w-5 text-white group-hover:text-orange-300"}
        />
      </button>
    </form>
  );
};
