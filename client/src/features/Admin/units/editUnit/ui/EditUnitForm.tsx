import { useTranslation } from "react-i18next";
import { UnitsListItem } from "@entities/units";
import React from "react";
import { InputWithLabel } from "@shared/ui/InputWithLabel";

interface EditUnitFormProps {
  values: UnitsListItem;
  handlerInput: ({ name, value }: { name: string; value: string }) => void;
}

export const EditUnitForm = ({ values, handlerInput }: EditUnitFormProps) => {
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
        label={t("unit.name")}
        name={"name"}
        placeholder={"g/l"}
        onChange={(value) => {
          handlerInput({ name: "name", value });
        }}
        className={"justify-between"}
        value={values.name}
      />
      <InputWithLabel
        label={t("unit.translationRu")}
        name={"translationRu"}
        placeholder={"г/л"}
        onChange={(value) => {
          handlerInput({ name: "translationRu", value });
        }}
        className={"justify-between"}
        value={values.translationRu}
      />
      <InputWithLabel
        label={t("unit.translationEn")}
        name={"translationEu"}
        placeholder={"g/l"}
        onChange={(value) => {
          handlerInput({ name: "translationEn", value });
        }}
        className={"justify-between"}
        value={values.translationEn}
      />
    </form>
  );
};
