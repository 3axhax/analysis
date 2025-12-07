import { Modal } from "@shared/ui/Modal";
import { useTranslation } from "react-i18next";
import { EditAnalysisPointForm } from "./EditAnalysisPointForm";
import { useEffect, useState } from "react";
import {
  addNewAnalysisPoint,
  AnalysisPointGreatItem,
  AnalysisPointLimit,
  editAnalysisPoint,
  getFullAnalysisPointList,
  setEditAnalysisPointId,
} from "@entities/analysisPoint";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { selectAnalysisPointsEditAnalysisPoint } from "@entities/analysisPoint/model/selectors.ts";

interface EditAnalysisPointModalProps {
  open: boolean;
  setOpen: (state: boolean) => void;
}

const initialFormValue: AnalysisPointGreatItem = {
  id: 0,
  name: "",
  translationRu: "",
  translationEn: "",
  parsingWords: "",
  limits: [],
};

export const EditAnalysisPointModal = ({
  open,
  setOpen,
}: EditAnalysisPointModalProps) => {
  const { t } = useTranslation("features");
  const dispatch = useAppDispatch();

  const editableAnalysisPoint = useAppSelector(
    selectAnalysisPointsEditAnalysisPoint,
  );

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

  const handlerInput = ({
    name,
    value,
  }: {
    name: string;
    value: string | AnalysisPointLimit[];
  }) => {
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
      className={"min-w-full md:min-w-[1200px]"}
      setOpen={(state) => {
        if (!state) {
          dispatch(setEditAnalysisPointId(0));
        }
        setOpen(state);
      }}
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
