import { Modal } from "@widgets/modal";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  addNewAge,
  AgesListItem,
  editAge,
  getAgesListWithTranslate,
} from "@entities/ages";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { EditAgeForm } from "@features/Admin/ages/editAges/ui/EditAgeForm.tsx";

interface EditAgeModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
  editableAge?: AgesListItem | null;
}

const initialFormValue: AgesListItem = {
  id: 0,
  name: "",
  translationRu: "",
  translationEn: "",
};

export const EditAgeModal = ({
  open,
  setOpen,
  editableAge,
}: EditAgeModalProps) => {
  const { t } = useTranslation("features");
  const dispatch = useAppDispatch();

  const [formValue, setFormValue] = useState<AgesListItem>(
    editableAge ?? initialFormValue,
  );

  useEffect(() => {
    setFormValue(editableAge ?? initialFormValue);
  }, [editableAge]);

  useEffect(() => {
    if (open && !editableAge) {
      setFormValue(initialFormValue);
    }
  }, [open, editableAge]);

  const handlerInput = ({ name, value }: { name: string; value: string }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  const handlerOnSubmit = () => {
    dispatch(!editableAge ? addNewAge(formValue) : editAge(formValue)).then(
      (res) => {
        if (res?.payload) {
          dispatch(getAgesListWithTranslate());
        }
      },
    );
  };

  return (
    <Modal
      open={open}
      className={"min-w-[600px]"}
      setOpen={setOpen}
      body={<EditAgeForm handlerInput={handlerInput} values={formValue} />}
      buttons={[
        {
          label: !editableAge ? t("editDialog.add") : t("editDialog.edit"),
          onClick: handlerOnSubmit,
          type: 'danger',
        },
      ]}
    />
  );
};
