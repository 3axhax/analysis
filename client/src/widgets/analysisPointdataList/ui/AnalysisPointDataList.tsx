import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { SelectAnalysisResultPointData } from "@entities/analysisResult/model/slice.ts";
import { Table, TableData, TableDataRow } from "@shared/ui/Table";
import { PointData } from "@entities/analysisResult";

export const AnalysisPointDataList = ({ resultId }: { resultId: string }) => {
  const { t } = useTranslation("common");
  const { t: tWidgets } = useTranslation("widgets");
  const { t: tEntities } = useTranslation("entities");
  const pointDataList = useAppSelector((state) =>
    SelectAnalysisResultPointData(state, resultId),
  );

  const tableData: TableData = {
    header: [
      { name: "name", label: tWidgets("analysisPointDataList.name") },
      { name: "interval", label: tWidgets("analysisPointDataList.interval") },
      { name: "value", label: tWidgets("analysisPointDataList.value") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (pointDataList?.length > 0) {
    tableData.rows = pointDataList.map((row: PointData) => [
      { name: "name", data: tEntities(`analysisPoint.${row.point.name}`) },
      {
        name: "interval",
        data: `${row.minValue} - ${row.maxValue} ${tEntities(`units.${row.pointUnit.name}`)}`,
      },
      {
        name: "value",
        data: `${row.value} ${tEntities(`units.${row.pointUnit.name}`)} ${t(`analysisDescriptionConditionStatus.${row.pointDataStatus}`)}`,
      },
    ]);
  }

  return <Table tableData={tableData} />;
};
