import React, { useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import { selectAgesError, useAgesWithTranslateLoad } from "@entities/ages";
import { AgesList } from "@features/Admin/ages/agesList";
import { AgesListPagination } from "@features/Admin/ages/agesListPagination";
import { EditAge } from "@features/Admin/ages/editAges";
import { useAppSelector } from "@shared/store/hooks.ts";

export const AgesPage: React.FC = () => {
  const { t } = useTranslation("common");
  const title = t("pageTitle.ages");
  useDocumentTitle(title);

  const [editAgeId, setEditAgeId] = useState<number>(0);

  const error = useAppSelector(selectAgesError);

  useAgesWithTranslateLoad();

  const handlerEditRecord = (id: number) => {
    setEditAgeId(id);
  };

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{title}</h1>
        <EditAge
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
          editAgeId={editAgeId}
          resetEdit={() => setEditAgeId(0)}
        />
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <AgesList handlerEditRecord={handlerEditRecord} />
      <AgesListPagination />
    </div>
  );
};
