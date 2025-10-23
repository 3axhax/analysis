import React, { useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import { UnitsList } from "@features/Admin/units/unitsList";
import { useUnitsLoad } from "@entities/units";

export const UnitsPage: React.FC = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.units"));

  const [editUnitsId, setEditUnitsId] = useState<number>(0);
  console.log(editUnitsId);

  useUnitsLoad();

  const handlerEditRecord = (id: number) => {
    setEditUnitsId(id);
  };

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{t("pageTitle.units")}</h1>
        {/*        <EditTranslation
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
          editTranslationId={editTranslationId}
          resetEdit={() => setEditTranslationId(0)}
        />*/}
      </div>
      <UnitsList handlerEditRecord={handlerEditRecord} />
      {/*<TranslationsList handlerEditRecord={handlerEditRecord} />*/}
      {/*<TranslationsListPagination />*/}
    </div>
  );
};
