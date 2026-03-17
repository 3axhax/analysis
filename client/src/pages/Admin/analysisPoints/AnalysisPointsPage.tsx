import React, { useEffect, useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useTranslation } from "react-i18next";
import {
  selectAnalysisPointsEditAnalysisPointId,
  selectAnalysisPointsError,
  useFullAnalysisPointsLoad,
} from "@entities/analysisPoint";
import { AnalysisPointsList } from "@widgets/Admin/analysisPointsList";
import { AnalysisPointsListPagination } from "@features/Admin/analysisPoints/analysisPointsListPagination";
import { useAppSelector } from "@shared/store/hooks";
import { EditAnalysisPointModal } from "@features/Admin/analysisPoints/editAnalysisPoint";
import { AddButton } from "@shared/ui/AddButton.tsx";

export const AnalysisPointsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const { t: tFeatures } = useTranslation("features");
  const title = t("pageTitle.analysisPoints");
  useDocumentTitle(title);

  const error = useAppSelector(selectAnalysisPointsError);

  const [openModal, setOpenModal] = useState<boolean>(false);

  useFullAnalysisPointsLoad();

  const editAnalysisPointId = useAppSelector(
    selectAnalysisPointsEditAnalysisPointId,
  );

  useEffect(() => {
    if (editAnalysisPointId && editAnalysisPointId > 0) {
      setOpenModal(true);
    }
  }, [editAnalysisPointId]);

  return (
    <div>
      <div className={"relative"}>
        <h1 className={"p-4 text-3xl"}>{title}</h1>
        <AddButton
          className={"absolute right-[5%] top-[calc(50%-20px)]"}
          title={tFeatures("editDialog.add")}
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </div>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <AnalysisPointsList />
      <AnalysisPointsListPagination />
      <AddButton
        className={"my-4"}
        title={tFeatures("editDialog.add")}
        onClick={() => {
          setOpenModal(true);
        }}
      />
      <EditAnalysisPointModal open={openModal} setOpen={setOpenModal} />
    </div>
  );
};
