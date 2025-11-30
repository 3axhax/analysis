import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import {
  deleteDescription,
  getDescriptionsListWithTranslate,
  setEditDescriptionId,
} from "@entities/descriptions";

export const DescriptionsListActionItems = ({ rowId }: { rowId: number }) => {
  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

  const handlerEditRecord = (id: number) => {
    console.log("handlerEditRecord", id);
    dispatch(setEditDescriptionId(id));
  };

  const handlerDeleteRecord = (id: number) => {
    openModal({
      onAccess: () => {
        dispatch(deleteDescription(id)).then((res) => {
          if (res?.payload) {
            dispatch(getDescriptionsListWithTranslate());
          }
        });
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
