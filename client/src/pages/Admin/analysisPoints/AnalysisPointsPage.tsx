import React from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import {
  selectAnalysisPointsError,
  useFullAnalysisPointsLoad,
} from "@entities/analysisPoint";
import { AnalysisPointsList } from "@widgets/Admin/analysisPointsList";
import { AnalysisPointsListPagination } from "@features/Admin/analysisPoints/analysisPointsListPagination";
import { useAppSelector } from "@shared/store/hooks";
import { EditAnalysisPoint } from "@widgets/Admin/editAnalysisPoint";

export const AnalysisPointsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const title = t("pageTitle.analysisPoints");
  useDocumentTitle(title);

  const error = useAppSelector(selectAnalysisPointsError);

  useFullAnalysisPointsLoad();

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{title}</h1>
        <EditAnalysisPoint
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
        />
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <AnalysisPointsList />
      <AnalysisPointsListPagination />
    </div>
  );
};
