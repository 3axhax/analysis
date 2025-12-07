import { useTranslation } from "react-i18next";
import { EditAgeModal } from "@features/Admin/ages/editAges/ui/EditAgeModal.tsx";
import { useEffect, useState } from "react";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAgeById } from "@entities/ages";
import { PlusCircleIcon } from "@heroicons/react/16/solid";

interface EditAgeProps {
  className?: string;
  editAgeId?: number;
  resetEdit: () => void;
}

export const EditAge = ({ className, editAgeId, resetEdit }: EditAgeProps) => {
  const { t } = useTranslation("features");
  const [openModal, setOpenModal] = useState<boolean>(!!editAgeId);

  const editableAge = useAppSelector((state) =>
    selectAgeById(state, Number(editAgeId)),
  );

  useEffect(() => {
    if (editAgeId && editAgeId > 0) {
      setOpenModal(true);
    }
  }, [editAgeId]);

  return (
    <>
      <button
        className={`btn bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
        onClick={() => {
          resetEdit();
          setOpenModal(true);
        }}
      >
        <PlusCircleIcon className="h-5 w-5 inline-flex mr-2" />
        {t("editDialog.add")}
      </button>
      <EditAgeModal
        open={openModal}
        setOpen={setOpenModal}
        editableAge={editableAge}
      />
    </>
  );
};
