import { Modal } from "@shared/ui/Modal";
import { useTranslation } from "react-i18next";
import { EditDescriptionForm } from "./EditDescriptionForm.tsx";
import { useEffect, useState } from "react";
import {
  addNewDescription,
  DescriptionGreatItem,
  DescriptionCondition,
  editDescription,
  getDescriptionsListWithTranslate,
  selectEditDescription,
  setEditDescriptionId,
} from "@entities/descriptions";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";

interface EditDescriptionModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
}

const initialFormValue: DescriptionGreatItem = {
  id: 0,
  description_ru: "",
  analysisResultDescriptionConditions: [],
};

export const EditDescriptionModal = ({
  open,
  setOpen,
}: EditDescriptionModalProps) => {
  const { t } = useTranslation("features");
  const dispatch = useAppDispatch();

  const editableDescription = useAppSelector(selectEditDescription);

  const [formValue, setFormValue] = useState<DescriptionGreatItem>(
    editableDescription ?? initialFormValue,
  );

  useEffect(() => {
    setFormValue(editableDescription ?? initialFormValue);
  }, [editableDescription]);

  useEffect(() => {
    if (open && !editableDescription) {
      setFormValue(initialFormValue);
    }
  }, [open, editableDescription]);

  const handlerInput = ({
    name,
    value,
  }: {
    name: string;
    value: string | DescriptionCondition[];
  }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  const handlerOnSubmit = () => {
    dispatch(
      !editableDescription
        ? addNewDescription(formValue)
        : editDescription(formValue),
    ).then((res) => {
      if (res?.payload) {
        dispatch(getDescriptionsListWithTranslate());
      }
    });
  };

  return (
    <Modal
      open={open}
      className={"min-w-[600px]"}
      setOpen={(state) => {
        if (!state) {
          dispatch(setEditDescriptionId(0));
        }
        setOpen(state);
      }}
      body={
        <EditDescriptionForm handlerInput={handlerInput} values={formValue} />
      }
      buttons={[
        {
          label: !editableDescription
            ? t("editDialog.add")
            : t("editDialog.edit"),
          onClick: handlerOnSubmit,
        },
      ]}
    />
  );
};
