import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ResultDescription } from "@entities/analysisResult";
import type { AnalysisResultDescriptionCondition, SourceDescriptionGroup, StatusValue } from "@entities/analysisResult/model/types.ts";
import { Table, TableData, TableDataRow } from "@shared/ui";
import { AnalysisPointDataListStatus } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus.tsx";
import { DescriptionItems } from "./DescriptionItems";
import { SourceInfo } from "./SourceInfo";

type ArticleCondition = Omit<AnalysisResultDescriptionCondition, "status"> & {
  statuses: StatusValue[];
  inheritedSource: boolean;
};

export type ArticleInterpretation = Omit<ResultDescription, "analysisResultDescriptionConditions"> & {
  source: SourceDescriptionGroup["source"] | null;
  analysisResultDescriptionConditions: ArticleCondition[];
};

type DescriptionListProps = {
  pointLabels?: ReadonlyMap<number, string>;
  className?: string;
} & ({
  descriptions: ResultDescription[];
  sourceGroups: SourceDescriptionGroup[];
} | {
  articleInterpretations: ArticleInterpretation[];
  pointLinks: ReadonlyMap<number, string>;
});

export const AnalysisDescriptionList = (props: DescriptionListProps) => {
  const { pointLabels, className } = props;
  const { t: tWidgets } = useTranslation("widgets");
  const { t: tEntities } = useTranslation("entities");
  const entries: {
    description: ResultDescription | Omit<ArticleInterpretation, "source">;
    source: SourceDescriptionGroup["source"] | null;
    inheritedPointIds: number[];
  }[] = "articleInterpretations" in props
    ? props.articleInterpretations.map(({ source, ...description }) => ({
        description,
        source,
        inheritedPointIds: [],
      }))
    : [
        ...props.descriptions.map((description) => ({
          description,
          source: null,
          inheritedPointIds: [],
        })),
        ...props.sourceGroups.flatMap(({ source, descriptions, inheritedPointIds }) =>
          descriptions.map((description) => ({ description, source, inheritedPointIds })),
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
    rows: entries.map(({ description, source, inheritedPointIds }): TableDataRow[] => [
      {
        name: "description",
        className: source ? "relative !pb-10" : undefined,
        data: (
          <div className="description__inner">
            <DescriptionItems
              description={source
                ? description.description_ru.replace(
                    " Статусы показателей определены по общим нормативам сервиса.",
                    "",
                  )
                : description.description_ru}
            />
            {source && (
              <div className="absolute bottom-2 right-3">
                <SourceInfo source={source} textTrigger />
              </div>
            )}
          </div>
        ),
      },
      {
        name: "reasons",
        data: (
          <ul className="flex flex-col">
            {description.analysisResultDescriptionConditions.map(
              (condition) => {
                const { id, name } = condition.analysisPoint;
                const label = pointLabels?.get(id) ||
                  tEntities(`analysisPoint.${name}`, { defaultValue: name });
                const href = "pointLinks" in props ? props.pointLinks.get(id) : undefined;
                const statuses = "statuses" in condition ? condition.statuses : [condition.status];
                const inheritedSource = "inheritedSource" in condition
                  ? condition.inheritedSource
                  : inheritedPointIds.includes(id);
                return (
                  <li key={condition.id}>
                    {href ? <Link className="text-cyan-600 underline" to={href}>{label}</Link> : label}
                    {source && !inheritedSource && <SourceInfo source={source} />}{" "}
                    {statuses.map((status, index) => (
                      <Fragment key={status}>
                        {index > 0 && " или "}
                        <AnalysisPointDataListStatus status={status} />
                      </Fragment>
                    ))}
                  </li>
                );
              },
            )}
          </ul>
        ),
      },
    ]),
  };

  return <Table tableData={tableData} className={className} />;
};
