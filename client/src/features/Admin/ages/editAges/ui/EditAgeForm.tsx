import { useTranslation } from "react-i18next";
import { AgesListItem } from "@entities/ages";
import React from "react";
import { InputWithLabel } from "@shared/ui/InputWithLabel";

interface EditAgeFormProps {
  values: AgesListItem;
  handlerInput: ({ name, value }: { name: string; value: string }) => void;
}

export const EditAgeForm = ({ values, handlerInput }: EditAgeFormProps) => {
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
        label={t("age.name")}
        name={"name"}
        placeholder={"2_3m"}
        onChange={(value) => {
          handlerInput({ name: "name", value });
        }}
        className={"justify-between"}
        value={values.name}
      />
      <InputWithLabel
        label={t("age.translationRu")}
        name={"translationRu"}
        placeholder={"2-3 мес."}
        onChange={(value) => {
          handlerInput({ name: "translationRu", value });
        }}
        className={"justify-between"}
        value={values.translationRu}
      />
      <InputWithLabel
        label={t("age.translationEn")}
        name={"translationEu"}
        placeholder={"2-3 month"}
        onChange={(value) => {
          handlerInput({ name: "translationEn", value });
        }}
        className={"justify-between"}
        value={values.translationEn}
      />
    </form>
  );
};
