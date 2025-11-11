import { Modal } from "@shared/ui/Modal";
import { useTranslation } from "react-i18next";
import { EditAnalysisPointForm } from "@features/Admin/analysisPoints/editAnalysisPoint/ui/EditAnalysisPointForm.tsx";
import { useEffect, useState } from "react";
import {
  addNewAnalysisPoint,
  AnalysisPointGreatItem,
  editAnalysisPoint,
  getFullAnalysisPointList,
} from "@entities/analysisPoint";
import { useAppDispatch } from "@shared/store/hooks.ts";

interface EditAnalysisPointModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
  editableAnalysisPoint?: AnalysisPointGreatItem | null;
}

const initialFormValue: AnalysisPointGreatItem = {
  id: 0,
  name: "",
  translationRu: "",
  translationEn: "",
  limits: [],
};

export const EditAnalysisPointModal = ({
  open,
  setOpen,
  editableAnalysisPoint,
}: EditAnalysisPointModalProps) => {
  const { t } = useTranslation("features");
  const dispatch = useAppDispatch();

  const [formValue, setFormValue] = useState<AnalysisPointGreatItem>(
    editableAnalysisPoint ?? initialFormValue,
  );

  useEffect(() => {
    setFormValue(editableAnalysisPoint ?? initialFormValue);
  }, [editableAnalysisPoint]);

  useEffect(() => {
    if (open && !editableAnalysisPoint) {
      setFormValue(initialFormValue);
    }
  }, [open, editableAnalysisPoint]);

  const handlerInput = ({ name, value }: { name: string; value: string }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  const handlerOnSubmit = () => {
    dispatch(
      !editableAnalysisPoint
        ? addNewAnalysisPoint(formValue)
        : editAnalysisPoint(formValue),
    ).then((res) => {
      if (res?.payload) {
        dispatch(getFullAnalysisPointList());
      }
    });
  };

  return (
    <Modal
      open={open}
      className={"min-w-[600px]"}
      setOpen={setOpen}
      body={
        <EditAnalysisPointForm handlerInput={handlerInput} values={formValue} />
      }
      buttons={[
        {
          label: !editableAnalysisPoint
            ? t("editDialog.add")
            : t("editDialog.edit"),
          onClick: handlerOnSubmit,
        },
      ]}
    />
  );
};
