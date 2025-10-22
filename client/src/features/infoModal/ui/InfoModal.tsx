import { Modal } from "@widgets/modal";
import { useTranslation } from "react-i18next";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { useEffect, useState } from "react";

type ModalButtons = {
  onClick?: () => void;
  label: string;
  type?: "standard" | "warning" | "danger";
}[];

export const InfoModal = () => {
  const { t } = useTranslation("features");

  const { open, closeModal, onAccess, title, type } = useInfoModalData();

  const [buttons, setButtons] = useState<ModalButtons>([]);

  useEffect(() => {
    setButtons(
      onAccess
        ? [
            {
              label: t("infoModal.delete"),
              type: type,
              onClick: () => {
                if (onAccess) {
                  onAccess();
                }
              },
            },
          ]
        : [],
    );
  }, [onAccess, t, type]);

  return (
    <Modal open={open} setOpen={closeModal} title={title} buttons={buttons} />
  );
};
