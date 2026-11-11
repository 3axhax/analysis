import { useTranslation } from "react-i18next";
import type { ResultDescription } from "@entities/analysisResult";
import type { SourceDescriptionGroup } from "@entities/analysisResult/model/types.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import { AnalysisPointDataListStatus } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus.tsx";
import { SourceInfo } from "./SourceInfo";
import { deRitisRuleLabel } from "@entities/descriptions";

export const AnalysisDescriptionList = ({
  descriptions,
  sourceGroups,
  className,
}: {
  descriptions: ResultDescription[];
  sourceGroups: SourceDescriptionGroup[];
  className?: string;
}) => {
  const { t: tWidgets } = useTranslation("widgets");
  const { t: tEntities } = useTranslation("entities");
  const entries = [
    ...descriptions.map((description) => ({ description, group: null })),
    ...sourceGroups.flatMap((group) =>
      group.descriptions.map((description) => ({ description, group })),
    ),
  ].sort(
    (a, b) =>
      b.description.analysisResultDescriptionConditions.length -
      a.description.analysisResultDescriptionConditions.length,
  );

  const tableData: TableData = {
    header: [
      {
        name: "description",
        label: tWidgets("analysisDescriptionList.description"),
      },
      { name: "reasons", label: tWidgets("analysisDescriptionList.reasons") },
    ],
    rows: entries.map(({ description, group }): TableDataRow[] => [
      {
        name: "description",
        className: group ? "relative !pb-10" : undefined,
        data: group ? (
          <div className="description__inner">
            <ul><li>{description.description_ru.replace(" Статусы показателей определены по общим нормативам сервиса.", "")}</li></ul>
            <div className="absolute bottom-2 right-3"><SourceInfo source={group.source} textTrigger /></div>
          </div>
        ) : (
          <div
            className="description__inner"
            dangerouslySetInnerHTML={{ __html: description.description_ru }}
          />
        ),
      },
      {
        name: "reasons",
        data: (
          <ul className="flex flex-col">
            {description.analysisResultDescriptionConditions.map(
              (condition) => (
                <li key={condition.id}>
                  {tEntities(`analysisPoint.${condition.analysisPoint.name}`)}
                  {description.deRitisRule && condition.analysisPoint.name === "de_ritis_ratio" && ` ${deRitisRuleLabel(description.deRitisRule)}`}
                  {group &&
                    !group.inheritedPointIds.includes(
                      condition.analysisPoint.id,
                    ) && <SourceInfo source={group.source} />}{" "}
                  <AnalysisPointDataListStatus status={condition.status} />
                </li>
              ),
            )}
          </ul>
        ),
      },
    ]),
  };

  return <Table tableData={tableData} className={className} />;
};
