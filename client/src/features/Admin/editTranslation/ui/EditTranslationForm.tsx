import { useTranslation } from "react-i18next";
import RadioGroup from "@shared/ui/RadioGroup.tsx";
import {
  TranslationLangType,
  TranslationsListItem,
} from "@entities/translations";
import React from "react";
import { InputWithLabel } from "@shared/ui/InputWithLabel";

interface EditTranslationFormProps {
  values: TranslationsListItem;
  handlerInput: ({ name, value }: { name: string; value: string }) => void;
}

export const EditTranslationForm = ({
  values,
  handlerInput,
}: EditTranslationFormProps) => {
  const { t } = useTranslation("features");
  const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <form
      onSubmit={handlerSubmit}
      className={"space-y-2 text-gray-600 dark:text-gray-300"}
    >
      <RadioGroup<TranslationLangType>
        label={t("editTranslationForm.lang")}
        name="lang"
        options={[
          { label: "ru", value: "ru" },
          { label: "en", value: "en" },
        ]}
        value={values.lang}
        onChange={(value) => {
          handlerInput({ name: "lang", value });
        }}
      />
      <InputWithLabel
        label={t("editTranslationForm.namespace")}
        name={"namespace"}
        placeholder={"entities"}
        onChange={(value) => {
          handlerInput({ name: "namespace", value });
        }}
        className={"justify-between"}
        value={values.namespace}
      />
      <InputWithLabel
        label={t("editTranslationForm.module")}
        name={"module"}
        placeholder={"analysisPoint"}
        onChange={(value) => {
          handlerInput({ name: "module", value });
        }}
        className={"justify-between"}
        value={values.module}
      />
      <InputWithLabel
        label={t("editTranslationForm.submodule")}
        name={"submodule"}
        placeholder={"hemoglobin"}
        onChange={(value) => {
          handlerInput({ name: "submodule", value });
        }}
        className={"justify-between"}
        value={values.submodule ?? ""}
      />
      <InputWithLabel
        label={t("editTranslationForm.value")}
        name={"value"}
        placeholder={"Hemoglobin (HGB)"}
        onChange={(value) => {
          handlerInput({ name: "value", value });
        }}
        className={"justify-between"}
        value={values.value}
      />
    </form>
  );
};
