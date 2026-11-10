import { SourceContext } from "@features/Admin/sourceAdmin/SourceAdmin";
import React, { useEffect } from "react";
import {
  selectAnalysisPointsEditAnalysisPointId,
  selectAnalysisPointsError,
  useFullAnalysisPointsLoad,
} from "@entities/analysisPoint";
import { AnalysisPointsList } from "@widgets/Admin/analysisPointsList";
import { AnalysisPointsListPagination } from "@features/Admin/analysisPoints/analysisPointsListPagination";
import { useAppSelector } from "@shared/store/hooks";
import { EditAnalysisPointModal } from "@features/Admin/analysisPoints/editAnalysisPoint";

const CommonAnalysisPointsPage: React.FC<{
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ open, setOpen }) => {
  const error = useAppSelector(selectAnalysisPointsError);

  useFullAnalysisPointsLoad();

  const editAnalysisPointId = useAppSelector(
    selectAnalysisPointsEditAnalysisPointId,
  );

  useEffect(() => {
    if (editAnalysisPointId && editAnalysisPointId > 0) {
      setOpen(true);
    }
  }, [editAnalysisPointId, setOpen]);

  return (
    <>
      {error !== "" ? (
        <div className={"bg-red-300 mb-2 p-2 rounded-lg"}>{error}</div>
      ) : null}
      <AnalysisPointsList />
      <AnalysisPointsListPagination />
      <EditAnalysisPointModal open={open} setOpen={setOpen} />
    </>
  );
};

export const AnalysisPointsPage: React.FC = () => (
  <SourceContext kind="points">
    {(open, setOpen) => (
      <CommonAnalysisPointsPage open={open} setOpen={setOpen} />
    )}
  </SourceContext>
);
