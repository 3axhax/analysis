import { Modal } from "@shared/ui/Modal";
import { useTranslation } from "react-i18next";
import { EditUnitForm } from "@features/Admin/units/editUnit/ui/EditUnitForm.tsx";
import { useEffect, useState } from "react";
import {
  addNewUnit,
  getUnitsList,
  UnitsListItem,
  editUnit,
} from "@entities/units";
import { useAppDispatch } from "@shared/store/hooks.ts";

interface EditUnitModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
  editableUnit?: UnitsListItem | null;
}

const initialFormValue: UnitsListItem = {
  id: 0,
  name: "",
  translationRu: "",
  translationEn: "",
};

export const EditUnitModal = ({
  open,
  setOpen,
  editableUnit,
}: EditUnitModalProps) => {
  const { t } = useTranslation("features");
  const dispatch = useAppDispatch();

  const [formValue, setFormValue] = useState<UnitsListItem>(
    editableUnit ?? initialFormValue,
  );

  useEffect(() => {
    setFormValue(editableUnit ?? initialFormValue);
  }, [editableUnit]);

  useEffect(() => {
    if (open && !editableUnit) {
      setFormValue(initialFormValue);
    }
  }, [open, editableUnit]);

  const handlerInput = ({ name, value }: { name: string; value: string }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  const handlerOnSubmit = () => {
    dispatch(!editableUnit ? addNewUnit(formValue) : editUnit(formValue)).then(
      (res) => {
        if (res?.payload) {
          dispatch(getUnitsList());
        }
      },
    );
  };

  return (
    <Modal
      open={open}
      className={"min-w-[600px]"}
      setOpen={setOpen}
      body={<EditUnitForm handlerInput={handlerInput} values={formValue} />}
      buttons={[
        {
          label: !editableUnit ? t("editDialog.add") : t("editDialog.edit"),
          onClick: handlerOnSubmit,
        },
      ]}
    />
  );
};
