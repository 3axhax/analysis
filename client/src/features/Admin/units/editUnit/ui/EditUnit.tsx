import { useTranslation } from "react-i18next";
import { EditUnitModal } from "@features/Admin/units/editUnit/ui/EditUnitModal.tsx";
import { useEffect, useState } from "react";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectUnitById } from "@entities/units";

interface EditUnitProps {
  className?: string;
  editUnitId?: number;
  resetEdit: () => void;
}

export const EditUnit = ({
  className,
  editUnitId,
  resetEdit,
}: EditUnitProps) => {
  const { t } = useTranslation("features");
  const [openModal, setOpenModal] = useState<boolean>(!!editUnitId);

  const editableUnit = useAppSelector((state) =>
    selectUnitById(state, Number(editUnitId)),
  );

  useEffect(() => {
    if (editUnitId && editUnitId > 0) {
      setOpenModal(true);
    }
  }, [editUnitId]);

  return (
    <>
      <button
        className={`bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
        onClick={() => {
          resetEdit();
          setOpenModal(true);
        }}
      >
        {t("editDialog.add")}
      </button>
      <EditUnitModal
        open={openModal}
        setOpen={setOpenModal}
        editableUnit={editableUnit}
      />
    </>
  );
};
