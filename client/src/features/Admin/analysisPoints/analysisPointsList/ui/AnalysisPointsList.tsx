import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@widgets/table";
import {
  deleteAnalysisPoint,
  selectAnalysisPointList,
  getFullAnalysisPointList,
  AnalysisPointListItem,
} from "@entities/analysisPoint";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";

interface AnalysisPointsListProps {
  handlerEditRecord: (id: number) => void;
}

export const AnalysisPointsList = ({
  handlerEditRecord,
}: AnalysisPointsListProps) => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("common");

  const dispatch = useAppDispatch();

  const { openModal } = useInfoModalData();

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

  const analysisPointList: AnalysisPointListItem[] = useAppSelector(
    selectAnalysisPointList,
  );

  console.log(analysisPointList);

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      { name: "name", label: t("analysisPoint.name") },
      { name: "translationRu", label: t("analysisPoint.translationRu") },
      { name: "translationEn", label: t("analysisPoint.translationEn") },
      { name: "limits", label: t("analysisPoint.limits") },
      { name: "action", label: tCommon("table.action") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (analysisPointList?.length > 0) {
    tableData.rows = analysisPointList.map((row: AnalysisPointListItem) => {
      console.log(row.limits);
      const limits =
        row.limits.length > 0 ? (
          <ul>
            {row.limits.map((limit, i) => (
              <li key={i}>
                {t(`gender.${limit.gender}`)}, {t(`ages.${limit.age}`)}:{" "}
                {limit.minValue === 0
                  ? ` < ${limit.maxValue}`
                  : limit.maxValue === 0
                    ? ` > ${limit.minValue}`
                    : `${limit.minValue} - ${limit.maxValue}`}{" "}
                {t(`units.${limit.unit}`)}
              </li>
            ))}
          </ul>
        ) : (
          ""
        );
      return [
        { name: "id", data: row.id.toString() },
        { name: "name", data: row.name },
        { name: "translationRu", data: row.translationRu },
        { name: "translationEn", data: row.translationEn },
        { name: "limits", data: limits, className: "text-start" },
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
      ];
    });
  }

  return <Table tableData={tableData} className={"max-w-[90%]"} />;
};
