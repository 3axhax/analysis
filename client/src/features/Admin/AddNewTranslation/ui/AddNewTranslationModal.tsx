import { Modal } from "@widgets/modal";
import { useTranslation } from "react-i18next";
import { AddNewTranslationForm } from "@features/Admin/addNewTranslation/ui/AddNewTranslationForm.tsx";
import { useState } from "react";
import {
  addNewTranslation,
  getTranslationsList,
  TranslationsListItem,
} from "@entities/translations";
import { useAppDispatch } from "@shared/store/hooks.ts";

interface AddNewTranslationModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
}

export const AddNewTranslationModal = ({
  open,
  setOpen,
}: AddNewTranslationModalProps) => {
  const { t } = useTranslation("features");
  const dispatch = useAppDispatch();

  const [formValue, setFormValue] = useState<TranslationsListItem>({
    lang: "ru",
    namespace: "",
    module: "",
    submodule: "",
    value: "",
  });

  const handlerInput = ({ name, value }: { name: string; value: string }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  const handlerOnSubmit = () => {
    dispatch(addNewTranslation(formValue)).then((res) => {
      if (res) {
        dispatch(getTranslationsList());
      }
    });
  };

  return (
    <Modal
      open={open}
      className={"min-w-[600px]"}
      setOpen={setOpen}
      body={
        <AddNewTranslationForm handlerInput={handlerInput} values={formValue} />
      }
      buttons={[
        {
          label: t("addNewTranslation.add"),
          onClick: handlerOnSubmit,
        },
      ]}
    />
  );
};
