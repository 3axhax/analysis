import { useTranslation } from "react-i18next";
import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import {
  selectAnalysisPointList,
  AnalysisPointListItem,
} from "@entities/analysisPoint";
import { AnalysisPointDataLimits } from "@widgets/Admin/analysisPointDataLimits";
import { AnalysisPointsListActionItems } from "@features/Admin/analysisPoints/analysisPointsListActionItems";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";

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
                {row.pointHintRu && (
                  <button
                    className={
                      "cursor-pointer description_anchor w-5 h-7 inline-flex text-gray-500 dark:text-gray-200 items-start justify-center hover:text-green-800"
                    }
                    type={"button"}
                    data-tooltip-content={row.pointHintRu}
                  >
                    <span className={"sr-only"}>Информация о показателе</span>
                    <InformationCircleIcon className="inline-flex h-4 w-4 transition-transform hover:scale-110" />
                  </button>
                )}
              </div>
              <div>
                {t("analysisPoint.translationEn")} -{" "}
                {row.translationEn !== "" ? row.translationEn : "Not set"}
                {row.pointHintEn && (
                  <button
                    className={
                      "cursor-pointer description_anchor w-5 h-7 inline-flex text-gray-500 dark:text-gray-200 items-start justify-center hover:text-green-800"
                    }
                    type={"button"}
                    data-tooltip-content={row.pointHintEn}
                  >
                    <span className={"sr-only"}>Информация о показателе</span>
                    <InformationCircleIcon className="inline-flex h-4 w-4 transition-transform hover:scale-110" />
                  </button>
                )}
              </div>
              <div>
                {t("analysisPoint.parsingString")} -{" "}
                {row.parsingWords !== "" ? `"${row.parsingWords}"` : "Not set"}
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

  return (
    <>
      <Tooltip
        anchorSelect=".description_anchor"
        place="top"
        className="max-w-xs !break-words !whitespace-normal !text-left"
      />
      <Table tableData={tableData} className={"max-w-[90%]"} />
    </>
  );
};
