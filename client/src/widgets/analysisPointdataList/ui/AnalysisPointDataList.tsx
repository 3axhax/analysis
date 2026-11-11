import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { SelectAnalysisResultPointData } from "@entities/analysisResult";
import { InfoPopover, Table, TableData, TableDataRow } from "@shared/ui";
import { PointData } from "@entities/analysisResult";
import { AnalysisPointDataListStatus } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus.tsx";
import cn from "classnames";
import { StatusValue } from "@entities/analysisResult/model/types.ts";
import { unitLabel } from "@entities/units";

export const AnalysisPointDataList = ({ resultId }: { resultId: string }) => {
  const { t: tWidgets } = useTranslation("widgets");
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
      {
        name: "name",
        data: (
          <div>
            {row.point.translationRu}
            {row.isCalculated && <span className="text-sm text-gray-500"> (расчётный)</span>}
            {row.point.pointHintRu && (
              <InfoPopover
                label="Информация о показателе"
                summary={row.point.pointHintRu}
                align="left"
              />
            )}
          </div>
        ),
      },
      {
        name: "interval",
        data:
          row.minValue === null || row.maxValue === null
            ? "Нет подходящего норматива"
            : `${row.minValue} - ${row.maxValue} ${unitLabel(row.pointUnit.name, row.sourceUnitText)}`,
      },
      {
        name: "value",
        data: (
          <span
            className={cn({
              "font-normal flex items-baseline":
                row.pointDataStatus === StatusValue.NORMAL,
              "font-bold flex items-baseline":
                row.pointDataStatus === StatusValue.HIGH ||
                row.pointDataStatus === StatusValue.LOW,
            })}
          >
            {`${row.displayValue ?? row.value} ${unitLabel(row.pointUnit.name, row.sourceUnitText)}`}
            &nbsp;
            <AnalysisPointDataListStatus status={row.pointDataStatus} />{" "}
            {row.calculation && row.calculation.unitId !== row.pointUnit.id && (
              <InfoPopover
                label="Значение в расчётных единицах"
                summary={`Для расчёта: ${row.calculation.value} ${unitLabel(row.calculation.unit)}`}
              />
            )}
          </span>
        ),
      },
    ]);
  }

  return <Table tableData={tableData} className={"result-table"} />;
};
