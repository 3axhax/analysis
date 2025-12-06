import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { selectUnitsList } from "@entities/units/model/slice.ts";
import { Table, TableData, TableDataRow } from "@shared/ui/Table";
import {
  deleteUnit,
  getUnitsListWithTranslate,
  UnitsListItem,
} from "@entities/units";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";

interface UnitsListProps {
  handlerEditRecord: (id: number) => void;
}

export const UnitsList = ({ handlerEditRecord }: UnitsListProps) => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("common");

  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

  const handlerDeleteRecord = (id: number) => {
    openModal({
      onAccess: () => {
        dispatch(deleteUnit(id)).then(() =>
          dispatch(getUnitsListWithTranslate()),
        );
      },
      title: `Удалить запись ID: ${id}?`,
      type: "danger",
    });
  };

  const unitList: UnitsListItem[] = useAppSelector(selectUnitsList);

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "name", label: t("unit.name") },
      { name: "translationRu", label: t("unit.translationRu") },
      { name: "translationEn", label: t("unit.translationEn") },
      { name: "action", label: tCommon("table.action") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (unitList?.length > 0) {
    tableData.rows = unitList.map((row: UnitsListItem) => [
      { name: "id", data: row.id.toString() },
      { name: "name", data: row.name },
      { name: "translationRu", data: row.translationRu },
      { name: "translationEn", data: row.translationEn },
      {
        name: "action",
        data: (
          <>
            <button type={'button'} onClick={() => handlerEditRecord(row.id)} className="w-6 h-6 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer ml-[10px]">
              <PencilSquareIcon className="w-5 h-5" />
            </button>
            <button type={'button'} className={'w-5 h-5 text-red-600 hover:text-red-700 transition-colors cursor-pointer ml-[10px]'} onClick={() => handlerDeleteRecord(row.id)}>
              <TrashIcon className="w-5 h-5" />
            </button>
          </>
        ),
        className: "flex justify-center",
      },
    ]);
  }

  return <Table tableData={tableData} className={"max-w-[90%] text-nowrap"} />;
};
