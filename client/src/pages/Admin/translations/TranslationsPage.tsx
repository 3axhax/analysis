import React from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import { useTranslationsLoad } from "@entities/translations";
import { TranslationsList } from "@widgets/Admin/translationList";
import { TranslationsListPagination } from "@features/Admin/translationsListPagination";
import { AddNewTranslation } from "@features/Admin/addNewTranslation";

export const TranslationsPage: React.FC = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.translations"));

  useTranslationsLoad();

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{t("pageTitle.translations")}</h1>
        <AddNewTranslation
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
        />
      </div>
      <TranslationsList />
      <TranslationsListPagination />
    </div>
  );
};
