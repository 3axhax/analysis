import React from "react";
import {
  DescriptionCondition,
  DescriptionGreatItem,
} from "@entities/descriptions";
import { DescriptionConditionsEditableList } from "./DescriptionConditionsEditableList";
import { TextArea } from "@shared/ui";

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
  const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <form
      onSubmit={handlerSubmit}
      className={"space-y-2 text-gray-600 dark:text-gray-300"}
    >
      <TextArea
        name={"description_ru"}
        value={values.description_ru}
        onChange={(value) => {
          handlerInput({ name: "description_ru", value });
        }}
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
