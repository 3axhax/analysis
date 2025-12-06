import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectEditDescriptionId } from "@entities/descriptions";
import { EditDescriptionModal } from "@features/Admin/descriptions/editDescription";
import { PlusCircleIcon } from "@heroicons/react/16/solid";

export const EditDescription = ({ className }: { className?: string }) => {
  const { t } = useTranslation("features");
  const [openModal, setOpenModal] = useState<boolean>(false);

  const editDescriptionId = useAppSelector(selectEditDescriptionId);

  useEffect(() => {
    if (editDescriptionId && editDescriptionId > 0) {
      setOpenModal(true);
    }
  }, [editDescriptionId]);

  return (
    <>
      <button
        className={`btn bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
        onClick={() => {
          setOpenModal(true);
        }}
      >
        <PlusCircleIcon className="h-5 w-5 inline-flex mr-2" />
        {t("editDialog.add")}
      </button>
      <EditDescriptionModal open={openModal} setOpen={setOpenModal} />
    </>
  );
};
