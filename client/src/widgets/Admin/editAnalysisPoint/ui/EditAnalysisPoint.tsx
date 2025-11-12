import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAnalysisPointsEditAnalysisPointId } from "@entities/analysisPoint";
import { EditAnalysisPointModal } from "@features/Admin/analysisPoints/editAnalysisPoint/ui/EditAnalysisPointModal.tsx";

interface EditAnalysisPointProps {
  className?: string;
}

export const EditAnalysisPoint = ({ className }: EditAnalysisPointProps) => {
  const { t } = useTranslation("features");
  const [openModal, setOpenModal] = useState<boolean>(false);

  const editAnalysisPointId = useAppSelector(
    selectAnalysisPointsEditAnalysisPointId,
  );

  useEffect(() => {
    if (editAnalysisPointId && editAnalysisPointId > 0) {
      setOpenModal(true);
    }
  }, [editAnalysisPointId]);

  return (
    <>
      <button
        className={`btn bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
        onClick={() => {
          setOpenModal(true);
        }}
      >
        {t("editDialog.add")}
      </button>
      <EditAnalysisPointModal open={openModal} setOpen={setOpenModal} />
    </>
  );
};
