import { useTranslation } from "react-i18next";
import { EditTranslationModal } from "@features/Admin/translations/editTranslation/ui/EditTranslationModal.tsx";
import { useEffect, useState } from "react";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectTranslationById } from "@entities/translations/model/slice.ts";

interface EditTranslationProps {
  className?: string;
  editTranslationId?: number;
  resetEdit: () => void;
}

export const EditTranslation = ({
  className,
  editTranslationId,
  resetEdit,
}: EditTranslationProps) => {
  const { t } = useTranslation("features");
  const [openModal, setOpenModal] = useState<boolean>(!!editTranslationId);

  const editableTranslation = useAppSelector((state) =>
    selectTranslationById(state, Number(editTranslationId)),
  );

  useEffect(() => {
    if (editTranslationId && editTranslationId > 0) {
      setOpenModal(true);
    }
  }, [editTranslationId]);

  return (
    <>
      <button
        className={`bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
        onClick={() => {
          resetEdit();
          setOpenModal(true);
        }}
      >
        {t("editTranslation.add")}
      </button>
      <EditTranslationModal
        open={openModal}
        setOpen={setOpenModal}
        editableTranslation={editableTranslation}
      />
    </>
  );
};
