import { useTranslation } from "react-i18next";
import { EditAnalysisPointModal } from "@features/Admin/analysisPoints/editAnalysisPoint/ui/EditAnalysisPointModal.tsx";
import { useEffect, useState } from "react";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAnalysisPointById } from "@entities/analysisPoint";

interface EditAnalysisPointProps {
  className?: string;
  editAnalysisPointId?: number;
  resetEdit: () => void;
}

export const EditAnalysisPoint = ({
  className,
  editAnalysisPointId,
  resetEdit,
}: EditAnalysisPointProps) => {
  const { t } = useTranslation("features");
  const [openModal, setOpenModal] = useState<boolean>(!!editAnalysisPointId);

  const editableAnalysisPoint = useAppSelector((state) =>
    selectAnalysisPointById(state, Number(editAnalysisPointId)),
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
          resetEdit();
          setOpenModal(true);
        }}
      >
        {t("editDialog.add")}
      </button>
      <EditAnalysisPointModal
        open={openModal}
        setOpen={setOpenModal}
        editableAnalysisPoint={editableAnalysisPoint}
      />
    </>
  );
};
