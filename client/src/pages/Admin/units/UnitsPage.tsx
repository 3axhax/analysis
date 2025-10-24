import React, { useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import { UnitsList } from "@features/Admin/units/unitsList";
import { selectUnitsError, useUnitsLoad } from "@entities/units";
import { UnitsListPagination } from "@features/Admin/units/unitsListPagination";
import { EditUnit } from "@features/Admin/units/editUnit";
import { useAppSelector } from "@shared/store/hooks.ts";

export const UnitsPage: React.FC = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.units"));

  const [editUnitId, setEditUnitId] = useState<number>(0);

  const error = useAppSelector(selectUnitsError);

  useUnitsLoad();

  const handlerEditRecord = (id: number) => {
    setEditUnitId(id);
  };

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{t("pageTitle.units")}</h1>
        <EditUnit
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
          editUnitId={editUnitId}
          resetEdit={() => setEditUnitId(0)}
        />
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <UnitsList handlerEditRecord={handlerEditRecord} />
      <UnitsListPagination />
    </div>
  );
};
