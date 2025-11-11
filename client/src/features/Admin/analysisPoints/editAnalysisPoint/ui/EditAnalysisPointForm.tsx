import { useTranslation } from "react-i18next";
import { AnalysisPointGreatItem } from "@entities/analysisPoint";
import React from "react";
import { InputWithLabel } from "@shared/ui/InputWithLabel";
import {
  AnalysisPointDataLimitsEditableList
} from "@widgets/Admin/analysisPointDataLimitsEditableList";

interface EditAnalysisPointFormProps {
  values: AnalysisPointGreatItem;
  handlerInput: ({ name, value }: { name: string; value: string }) => void;
}

export const EditAnalysisPointForm = ({
  values,
  handlerInput,
}: EditAnalysisPointFormProps) => {
  const { t } = useTranslation("entities");
  const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <form
      onSubmit={handlerSubmit}
      className={"space-y-2 text-gray-600 dark:text-gray-300"}
    >
      <InputWithLabel
        label={t("analysisPoint.name")}
        name={"name"}
        placeholder={"g/l"}
        onChange={(value) => {
          handlerInput({ name: "name", value });
        }}
        className={"justify-between"}
        value={values.name}
      />
      <InputWithLabel
        label={t("analysisPoint.translationRu")}
        name={"translationRu"}
        placeholder={"г/л"}
        onChange={(value) => {
          handlerInput({ name: "translationRu", value });
        }}
        className={"justify-between"}
        value={values.translationRu}
      />
      <InputWithLabel
        label={t("analysisPoint.translationEn")}
        name={"translationEu"}
        placeholder={"g/l"}
        onChange={(value) => {
          handlerInput({ name: "translationEn", value });
        }}
        className={"justify-between"}
        value={values.translationEn}
      />
      <AnalysisPointDataLimitsEditableList/>
    </form>
  );
};
