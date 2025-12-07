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

  return (
    <>
      <button
        type={"button"}
        onClick={() => handlerEditRecord(rowId)}
        className={
          "w-6 h-6 text-blue-600 cursor-pointer ml-[10px] hover:text-blue-700 transition-colors"
        }
      >
        <PencilSquareIcon className="w-5 h-5" />
      </button>
      <button
        type={"button"}
        onClick={() => handlerDeleteRecord(rowId)}
        className={
          "w-6 h-6 text-red-600 cursor-pointer ml-[10px] hover:text-red-700 transition-colors"
        }
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </>
  );
};
