import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { selectTranslationsList } from "@entities/translations/model/slice.ts";
import { Table, TableData, TableDataRow } from "@widgets/table";
import {
  deleteTranslation,
  getTranslationsList,
  TranslationsListItem,
} from "@entities/translations";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";

interface TranslationsListProps {
  handlerEditRecord: (id: number) => void;
}

export const TranslationsList = ({
  handlerEditRecord,
}: TranslationsListProps) => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("common");

  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

  const handlerDeleteRecord = (id: number) => {
    openModal({
      onAccess: () => {
        dispatch(deleteTranslation(id)).then(() =>
          dispatch(getTranslationsList()),
        );
      },
      title: `Удалить запись ID: ${id}?`,
      type: "danger",
    });
  };

  const translationList: TranslationsListItem[] = useAppSelector(
    selectTranslationsList,
  );

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "lang", label: t("translation.lang") },
      { name: "namespace", label: t("translation.namespace") },
      { name: "module", label: t("translation.module") },
      { name: "submodule", label: t("translation.submodule") },
      { name: "value", label: t("translation.value") },
      { name: "action", label: tCommon("translationsList.action") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (translationList?.length > 0) {
    tableData.rows = translationList.map((row: TranslationsListItem) => [
      { name: "id", data: row.id.toString() },
      { name: "lang", data: row.lang },
      { name: "namespace", data: row.namespace },
      { name: "module", data: row.module },
      { name: "submodule", data: row.submodule ? row.submodule : "" },
      { name: "value", data: row.value },
      {
        name: "action",
        data: (
          <>
            <PencilSquareIcon
              className="w-5 h-5 text-blue-500 cursor-pointer ml-[10px]"
              onClick={() => handlerEditRecord(row.id)}
            />
            <TrashIcon
              className="w-5 h-5 text-red-500 cursor-pointer ml-[10px]"
              onClick={() => handlerDeleteRecord(row.id)}
            />
          </>
        ),
        className: "flex justify-center",
      },
    ]);
  }

  return <Table tableData={tableData} className={"max-w-[90%]"} />;
};
