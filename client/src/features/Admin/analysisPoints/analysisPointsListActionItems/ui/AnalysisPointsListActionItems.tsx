import { TableActions } from "@shared/ui";
import {
  deleteAnalysisPoint,
  getFullAnalysisPointList,
  setEditAnalysisPointId,
} from "@entities/analysisPoint";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useInfoModalData } from "@app/providers/infoModalProvider";

interface AnalysisPointsListActionItemsProps {
  rowId: number;
}

export const AnalysisPointsListActionItems = ({
  rowId,
}: AnalysisPointsListActionItemsProps) => {
  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

  const handlerEditRecord = (id: number) => {
    dispatch(setEditAnalysisPointId(id));
  };

  const handlerDeleteRecord = (id: number) => {
    openModal({
      onAccess: () => {
        dispatch(deleteAnalysisPoint(id)).then((res) => {
          if (res?.payload) {
            dispatch(getFullAnalysisPointList());
          }
        });
      },
      title: `Удалить запись ID: ${id}?`,
      type: "danger",
    });
  };

  return <TableActions onEdit={() => handlerEditRecord(rowId)} onDelete={() => handlerDeleteRecord(rowId)} />;
};
