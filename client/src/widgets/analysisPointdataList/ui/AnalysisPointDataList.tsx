import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { SelectAnalysisResultPointData } from "@entities/analysisResult";
import { Table, TableData, TableDataRow } from "@shared/ui";
import { PointData } from "@entities/analysisResult";
import { AnalysisPointDataListStatus } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus.tsx";
import cn from "classnames";
import { StatusValue } from "@entities/analysisResult/model/types.ts";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";
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
            {row.point.pointHintRu && (
              <button
                className={
                  "cursor-pointer description_anchor w-5 h-7 inline-flex text-gray-500 dark:text-gray-200 items-start justify-center hover:text-green-800"
                }
                type={"button"}
                data-tooltip-content={row.point.pointHintRu}
              >
                <span className={"sr-only"}>Информация о показателе</span>
                <InformationCircleIcon className="inline-flex h-4 w-4 transition-transform hover:scale-110" />
              </button>
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
            {`${row.value} ${unitLabel(row.pointUnit.name, row.sourceUnitText)}`}
            &nbsp;
            <AnalysisPointDataListStatus status={row.pointDataStatus} />{" "}
            {row.calculation && row.calculation.unitId !== row.pointUnit.id && (
              <span
                className="ml-2 text-gray-500"
                title={`Для расчёта: ${row.calculation.value} ${unitLabel(row.calculation.unit)}`}
                aria-label="Значение в расчётных единицах"
              >
                ⓘ
              </span>
            )}
          </span>
        ),
      },
    ]);
  }

  return (
    <>
      <Tooltip
        anchorSelect=".description_anchor"
        place="top"
        className="max-w-xs !break-words !whitespace-normal !text-left"
      />
      <Table tableData={tableData} className={"result-table"} />
    </>
  );
};
