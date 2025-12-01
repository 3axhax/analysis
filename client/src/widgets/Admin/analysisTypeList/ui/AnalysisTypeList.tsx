import { useTranslation } from "react-i18next";
import { useAppSelector } from "@shared/store/hooks.ts";
import { Table, TableData, TableDataRow } from "@shared/ui/Table";
import { selectAdminAnalysisTypeList } from "@entities/adminAnalysisType";
import { AnalysisTypePointList } from "@widgets/Admin/analysisTypeList/ui/AnalysisTypePointList.tsx";

export const AnalysisTypeList = () => {
  const { t } = useTranslation("entities");
  const { t: tCommon } = useTranslation("common");

  const analysisTypeList = useAppSelector(selectAdminAnalysisTypeList);

  const tableData: TableData = {
    header: [
      { name: "id", label: "ID" },
      {
        name: "name",
        label: t("analysisPoint.name"),
        className: "min-w-[300px]",
      },
      {
        name: "analysis",
        label: t("analysisPoint.list"),
        className: "min-w-[300px]",
      },
      { name: "action", label: tCommon("table.action") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (analysisTypeList?.length > 0) {
    tableData.rows = analysisTypeList.map((row) => {
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
          name: "analysis",
          data: <AnalysisTypePointList list={row.analysisPoint} />,
          className: "text-start",
        },
        {
          name: "action",
          data: " " /*<AnalysisPointsListActionItems rowId={row.id} />*/,
          className: "flex justify-center",
        },
      ];
    });
  }

  return <Table tableData={tableData} className={"max-w-[90%]"} />;
};
