import React from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import { useTranslationsLoad } from "@entities/translations";

const Translations: React.FC = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.translations"));

  useTranslationsLoad();

  return (
    <div>
      <h1 className={"p-4 text-3xl"}>{t("pageTitle.translations")}</h1>
    </div>
  );
};

export default Translations;
