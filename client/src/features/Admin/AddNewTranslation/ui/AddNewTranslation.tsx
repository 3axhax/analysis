import { useTranslation } from "react-i18next";
import { AddNewTranslationModal } from "@features/Admin/addNewTranslation/ui/AddNewTranslationModal.tsx";
import { useState } from "react";

interface AddNewTranslationProps {
    className?: string;
}

export const AddNewTranslation = ({ className }: AddNewTranslationProps) => {
    const { t } = useTranslation("features");
    const [openModal, setOpenModal] = useState<boolean>(false);
    return (
        <>
            <button
                className={`bg-green-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-green-500${className ? " " + className : ""}`}
                onClick={() => {
                    setOpenModal(true);
                }}
            >
                {t("addNewTranslation.add")}
            </button>
            <AddNewTranslationModal open={openModal} setOpen={setOpenModal} />
        </>
    );
};
