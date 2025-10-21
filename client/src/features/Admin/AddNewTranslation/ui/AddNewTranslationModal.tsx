import { Modal } from "@widgets/modal";
import { useTranslation } from "react-i18next";

interface AddNewTranslationModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
}

export const AddNewTranslationModal = ({
  open,
  setOpen,
}: AddNewTranslationModalProps) => {
  const { t } = useTranslation("features");
  return (
    <Modal
      open={open}
      setOpen={setOpen}
      body={<h1>HI</h1>}
      buttons={[
        {
          label: t("addNewTranslation.add"),
          onClick: () => {
            console.log("Add Translation");
          },
          type: "warning",
        },
      ]}
    />
  );
};
