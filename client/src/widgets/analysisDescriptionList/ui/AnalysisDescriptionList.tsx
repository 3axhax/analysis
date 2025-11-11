import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectAnalysisResultDescriptionData } from "@entities/analysisResult";
import { useTranslation } from "react-i18next";
import { ResultDescription } from "@entities/analysisResult";
import { Table, TableData, TableDataRow } from "@shared/ui/Table";

export const AnalysisDescriptionList = ({
  resultId,
  className,
}: {
  resultId: string;
  className?: string;
}) => {
  const { t } = useTranslation("common");
  const { t: tWidgets } = useTranslation("widgets");
  const { t: tEntities } = useTranslation("entities");
  const descriptionList: ResultDescription[] = useAppSelector((state) =>
    SelectAnalysisResultDescriptionData(state, resultId),
  );

  const tableData: TableData = {
    header: [
      {
        name: "description",
        label: tWidgets("analysisDescriptionList.description"),
      },
      { name: "reasons", label: tWidgets("analysisDescriptionList.reasons") },
    ],
    rows: [] as TableDataRow[][],
  };

  if (descriptionList?.length > 0) {
    tableData.rows = [...descriptionList]
      .sort(
        (a, b) =>
          b.analysisResultDescriptionConditions.length -
          a.analysisResultDescriptionConditions.length,
      )
      .map((row: ResultDescription) => [
        { name: "description", data: row.description_ru },
        {
          name: "reasons",
          data: (
            <ul>
              {row.analysisResultDescriptionConditions.map((condition) => (
                <li key={condition.id}>
                  {tEntities(`analysisPoint.${condition.analysisPoint.name}`)} -{" "}
                  {t(`analysisDescriptionConditionStatus.${condition.status}`)}
                </li>
              ))}
            </ul>
          ),
        },
      ]);
  }

  return <Table tableData={tableData} className={className} />;
};
