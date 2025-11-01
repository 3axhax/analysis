import React, { useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import {
  selectAnalysisPointsError,
  useFullAnalysisPointsLoad,
} from "@entities/analysisPoint";
import { AnalysisPointsList } from "@features/Admin/analysisPoints/analysisPointsList";
import { AnalysisPointsListPagination } from "@features/Admin/analysisPoints/analysisPointsListPagination";
import { EditAnalysisPoint } from "@features/Admin/analysisPoints/editAnalysisPoint";
import { useAppSelector } from "@shared/store/hooks.ts";

export const AnalysisPointsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const title = t("pageTitle.analysisPoints");
  useDocumentTitle(title);

  const [editAnalysisPointId, setEditAnalysisPointId] = useState<number>(0);
  console.log(editAnalysisPointId);

  const error = useAppSelector(selectAnalysisPointsError);

  useFullAnalysisPointsLoad();

  const handlerEditRecord = (id: number) => {
    setEditAnalysisPointId(id);
  };

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{title}</h1>
        <EditAnalysisPoint
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
          editAnalysisPointId={editAnalysisPointId}
          resetEdit={() => setEditAnalysisPointId(0)}
        />
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <AnalysisPointsList handlerEditRecord={handlerEditRecord} />
      <AnalysisPointsListPagination />
    </div>
  );
};
