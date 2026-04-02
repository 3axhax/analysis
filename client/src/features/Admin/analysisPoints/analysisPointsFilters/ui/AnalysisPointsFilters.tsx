import { InputWithLabel } from "@shared/ui";
import { useTranslation } from "react-i18next";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";
import React, { useState } from "react";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { getFullAnalysisPointList, setFilters } from "@entities/analysisPoint";

const initialFormValue = {
  name: "",
  translationRu: "",
  translationEn: "",
};

export const AnalysisPointsFilters = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("entities");

  const [formValue, setFormValue] = useState(initialFormValue);

  const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(getFullAnalysisPointList());
  };

  const handlerInput = ({ name, value }: { name: string; value: string }) => {
    const filtersValues = { ...formValue, [name]: value };
    setFormValue(filtersValues);
    dispatch(setFilters(filtersValues));
  };

  const handlerClear = () => {
    setFormValue(initialFormValue);
    dispatch(setFilters({}));
    dispatch(getFullAnalysisPointList());
  };

  return (
    <form
      className={"flex items-center justify-center space-x-2 m-auto max-w-[90%] mb-5"}
      onSubmit={handlerSubmit}
    >
      <InputWithLabel
        label={t("analysisPoint.name")}
        name={"name"}
        placeholder={"hemoglobin"}
        onChange={(value) => {
          handlerInput({ name: "name", value });
        }}
        className={"justify-between"}
        value={formValue.name}
      />
      <InputWithLabel
        label={t("analysisPoint.translationRu")}
        name={"translationRu"}
        placeholder={"Гемоглобин (HGB)"}
        onChange={(value) => {
          handlerInput({ name: "translationRu", value });
        }}
        className={"justify-between"}
        value={formValue.translationRu}
      />
      <InputWithLabel
        label={t("analysisPoint.translationEn")}
        name={"translationEn"}
        placeholder={"Hemoglobin (HGB)"}
        onChange={(value) => {
          handlerInput({ name: "translationEn", value });
        }}
        className={"justify-between"}
        value={formValue.translationEn}
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
