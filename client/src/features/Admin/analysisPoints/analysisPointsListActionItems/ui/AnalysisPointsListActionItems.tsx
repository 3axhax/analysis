import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
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
        dispatch(deleteAnalysisPoint(id)).then(() =>
          dispatch(getFullAnalysisPointList()),
        );
      },
      title: `Удалить запись ID: ${id}?`,
      type: "danger",
    });
  };

  return (
    <>
      <PencilSquareIcon
        className="w-5 h-5 text-blue-500 cursor-pointer ml-[10px]"
        onClick={() => handlerEditRecord(rowId)}
      />
      <TrashIcon
        className="w-5 h-5 text-red-500 cursor-pointer ml-[10px]"
        onClick={() => handlerDeleteRecord(rowId)}
      />
    </>
  );
};
