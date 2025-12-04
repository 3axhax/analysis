import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui/Table";
import {
  deleteAge,
  AgesListItem,
  selectAgesList,
  getAgesListWithTranslate,
} from "@entities/ages";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";

interface AgesListProps {
  handlerEditRecord: (id: number) => void;
}

export const AgesList = ({ handlerEditRecord }: AgesListProps) => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("common");

  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

  const handlerDeleteRecord = (id: number) => {
    openModal({
      onAccess: () => {
        dispatch(deleteAge(id)).then(() =>
          dispatch(getAgesListWithTranslate()),
        );
      },
      title: `Удалить запись ID: ${id}?`,
      type: "danger",
    });
  };

  const ageList: AgesListItem[] = useAppSelector(selectAgesList);

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "name", label: t("age.name") },
      { name: "translationRu", label: t("age.translationRu") },
      { name: "translationEn", label: t("age.translationEn") },
      { name: "action", label: tCommon("table.action") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (ageList?.length > 0) {
    tableData.rows = ageList.map((row: AgesListItem) => [
      { name: "id", data: row.id.toString() },
      { name: "name", data: row.name },
      { name: "translationRu", data: row.translationRu },
      { name: "translationEn", data: row.translationEn },
      {
        name: "action",
        data: (
          <>
            <button
              type={"button"}
              onClick={() => handlerEditRecord(row.id)}
              className="w-6 h-6 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer ml-[10px]"
            >
              <PencilSquareIcon className="w-5 h-5"/>
            </button>
            <button
              type={"button"}
              className={"w-5 h-5 text-red-600 hover:text-red-700 transition-colors cursor-pointer ml-[10px]"}
              onClick={() => handlerDeleteRecord(row.id)}
            >
              <TrashIcon className="w-5 h-5"/>
            </button>
          </>
        ),
        className: "flex justify-center",
      },
    ]);
  }

  return <Table tableData={tableData} className={"max-w-[90%]"} />;
};
