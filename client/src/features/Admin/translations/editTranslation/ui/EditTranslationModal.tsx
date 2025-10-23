import { Modal } from "@widgets/modal";
import { useTranslation } from "react-i18next";
import { EditTranslationForm } from "@features/Admin/translations/editTranslation/ui/EditTranslationForm.tsx";
import { useEffect, useState } from "react";
import {
  addNewTranslation,
  getTranslationsList,
  TranslationsListItem,
  editTranslation,
} from "@entities/translations";
import { useAppDispatch } from "@shared/store/hooks.ts";

interface EditTranslationModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
  editableTranslation?: TranslationsListItem | null;
}

const initialFormValue: TranslationsListItem = {
  id: 0,
  lang: "ru",
  namespace: "",
  module: "",
  submodule: "",
  value: "",
};

export const EditTranslationModal = ({
  open,
  setOpen,
  editableTranslation,
}: EditTranslationModalProps) => {
  const { t } = useTranslation("features");
  const dispatch = useAppDispatch();

  const [formValue, setFormValue] = useState<TranslationsListItem>(
    editableTranslation ?? initialFormValue,
  );

  useEffect(() => {
    setFormValue(editableTranslation ?? initialFormValue);
  }, [editableTranslation]);

  useEffect(() => {
    if (open && !editableTranslation) {
      setFormValue(initialFormValue);
    }
  }, [open, editableTranslation]);

  const handlerInput = ({ name, value }: { name: string; value: string }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  const handlerOnSubmit = () => {
    dispatch(
      !editableTranslation
        ? addNewTranslation(formValue)
        : editTranslation(formValue),
    ).then((res) => {
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
        <EditTranslationForm handlerInput={handlerInput} values={formValue} />
      }
      buttons={[
        {
          label: !editableTranslation
            ? t("editTranslation.add")
            : t("editTranslation.edit"),
          onClick: handlerOnSubmit,
        },
      ]}
    />
  );
};
