import React, { useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import {
  selectTranslationsError,
  useTranslationsLoad,
} from "@entities/translations";
import { TranslationsList } from "@features/Admin/translations/translationsList";
import { TranslationsListPagination } from "@features/Admin/translations/translationsListPagination";
import { EditTranslation } from "@features/Admin/translations/editTranslation";
import { useAppSelector } from "@shared/store/hooks.ts";

export const TranslationsPage: React.FC = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.translations"));

  const [editTranslationId, setEditTranslationId] = useState<number>(0);

  const error = useAppSelector(selectTranslationsError);

  useTranslationsLoad();

  const handlerEditRecord = (id: number) => {
    setEditTranslationId(id);
  };

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{t("pageTitle.translations")}</h1>
        <EditTranslation
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
          editTranslationId={editTranslationId}
          resetEdit={() => setEditTranslationId(0)}
        />
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <TranslationsList handlerEditRecord={handlerEditRecord} />
      <TranslationsListPagination />
    </div>
  );
};
