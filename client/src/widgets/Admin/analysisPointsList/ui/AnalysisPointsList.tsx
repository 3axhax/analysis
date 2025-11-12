import { useTranslation } from "react-i18next";
import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui/Table";
import {
  selectAnalysisPointList,
  AnalysisPointListItem,
} from "@entities/analysisPoint";
import { AnalysisPointDataLimits } from "@widgets/Admin/analysisPointDataLimits";
import { AnalysisPointsListActionItems } from "@features/Admin/analysisPoints/analysisPointsListActionItems";

export const AnalysisPointsList = () => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("common");

  const analysisPointList: AnalysisPointListItem[] = useAppSelector(
    selectAnalysisPointList,
  );

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      {
        name: "name",
        label: t("analysisPoint.name"),
        className: "min-w-[300px]",
      },
      {
        name: "limits",
        label: t("analysisPoint.limits"),
        className: "min-w-[300px]",
      },
      { name: "action", label: tCommon("table.action") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (analysisPointList?.length > 0) {
    tableData.rows = analysisPointList.map((row: AnalysisPointListItem) => {
      return [
        { name: "id", data: row.id.toString() },
        {
          name: "name",
          data: (
            <div>
              <div>{row.name}</div>
              <div>
                {t("analysisPoint.translationRu")} -{" "}
                {row.translationRu !== "" ? row.translationRu : "Not set"}
              </div>
              <div>
                {t("analysisPoint.translationEn")} -{" "}
                {row.translationEn !== "" ? row.translationEn : "Not set"}
              </div>
            </div>
          ),
        },
        {
          name: "limits",
          data: <AnalysisPointDataLimits analysisPointId={row.id} />,
          className: "text-start",
        },
        {
          name: "action",
          data: <AnalysisPointsListActionItems rowId={row.id} />,
          className: "flex justify-center",
        },
      ];
    });
  }

  return <Table tableData={tableData} className={"max-w-[90%]"} />;
};
