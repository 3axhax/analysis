import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { SelectAnalysisResultPointData } from "@entities/analysisResult";
import { Table, TableData, TableDataRow } from "@shared/ui";
import { PointData } from "@entities/analysisResult";
import { AnalysisPointDataListStatus } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus.tsx";
import cn from "classnames";
import { StatusValue } from "@entities/analysisResult/model/types.ts";

export const AnalysisPointDataList = ({ resultId }: { resultId: string }) => {
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
    console.log(pointDataList);
    tableData.rows = pointDataList.map((row: PointData) => [
      { name: "name", data: tEntities(`analysisPoint.${row.point.name}`) },
      {
        name: "interval",
        data: `${row.minValue} - ${row.maxValue} ${tEntities(`units.${row.pointUnit.name}`)}`,
      },
      {
        name: "value",
        data: (
          <span
            className={cn({
              "font-normal flex items-baseline":
                row.pointDataStatus === StatusValue.NORMAL,
              "font-semibold flex items-baseline":
                row.pointDataStatus === StatusValue.HIGH ||
                row.pointDataStatus === StatusValue.LOW,
            })}
          >
            {`${row.value} ${tEntities(`units.${row.pointUnit.name}`)}`}
            <AnalysisPointDataListStatus row={row} />{" "}
          </span>
        ),
      },
    ]);
  }

  return <Table tableData={tableData} />;
};
