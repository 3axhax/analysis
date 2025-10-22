import React, { useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import { useTranslationsLoad } from "@entities/translations";
import { TranslationsList } from "@features/Admin/translationList";
import { TranslationsListPagination } from "@features/Admin/translationsListPagination";
import { EditTranslation } from "@features/Admin/editTranslation";

export const TranslationsPage: React.FC = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.translations"));

  const [editTranslationId, setEditTranslationId] = useState<number>(0);

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
      <TranslationsList handlerEditRecord={handlerEditRecord} />
      <TranslationsListPagination />
    </div>
  );
};
