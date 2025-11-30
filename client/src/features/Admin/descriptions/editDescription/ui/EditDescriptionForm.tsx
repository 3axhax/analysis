import { useTranslation } from "react-i18next";
import React from "react";
import { InputWithLabel } from "@shared/ui/InputWithLabel";
import {
  DescriptionCondition,
  DescriptionGreatItem,
} from "@entities/descriptions";
import { DescriptionConditionsEditableList } from "@features/Admin/descriptions/editDescription/ui/DescriptionConditionsEditableList.tsx";

interface EditAnalysisPointFormProps {
  values: DescriptionGreatItem;
  handlerInput: ({
    name,
    value,
  }: {
    name: string;
    value: string | DescriptionCondition[];
  }) => void;
}

export const EditDescriptionForm = ({
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
        label={t("descriptions.translationRu")}
        name={"description_ru"}
        placeholder={"hemoglobin"}
        onChange={(value) => {
          handlerInput({ name: "description_ru", value });
        }}
        className={"justify-between"}
        value={values.description_ru}
      />
      <DescriptionConditionsEditableList
        onChange={(value) => {
          handlerInput({ name: "analysisResultDescriptionConditions", value });
        }}
        conditions={values.analysisResultDescriptionConditions}
      />
    </form>
  );
};
