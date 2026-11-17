import { useEffect, useId, useState } from "react";
import Select from "react-select";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { SelectAnalysisResultPointData } from "@entities/analysisResult";
import { InfoPopover, Table, TableData, TableDataRow } from "@shared/ui";
import type { SelectUIOption } from "@shared/ui/SelectUI.tsx";
import { PointData } from "@entities/analysisResult";
import { AnalysisPointDataListStatus } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListStatus.tsx";
import { SourceInfo } from "@widgets/analysisDescriptionList/ui/SourceInfo";
import cn from "classnames";
import { StatusValue } from "@entities/analysisResult/model/types.ts";
import { unitLabel } from "@entities/units";

type Reference = NonNullable<PointData["displayReferences"]>[number];
type Match = NonNullable<PointData["matchingIntervals"]>[number];
const sourceKey = (item: { sourceId: number | null }) =>
  item.sourceId === null ? "common" : `document-${item.sourceId}`;
const filterKey = (item: {
  sourceId: number | null;
  source: { rootId: number } | null;
}) => (item.sourceId === null ? "common" : `source-${item.source?.rootId}`);
const intervalText = (r: Reference) => {
  const min = `${r.minApproximate ? "≈ " : ""}${r.minValue}`;
  const max = `${r.maxApproximate ? "≈ " : ""}${r.maxValue}`;
  if (
    r.minValue !== null &&
    r.maxValue !== null &&
    r.minValue === r.maxValue &&
    r.minValueEqual &&
    r.maxValueEqual
  )
    return `= ${min}`;
  if (
    r.minValue !== null &&
    r.maxValue !== null &&
    r.minValueEqual &&
    r.maxValueEqual
  )
    return `${min} - ${max}`;
  return [
    r.minValue !== null ? `${r.minValueEqual ? "≥" : ">"} ${min}` : null,
    r.maxValue !== null ? `${r.maxValueEqual ? "≤" : "<"} ${max}` : null,
  ]
    .filter(Boolean)
    .join(", ");
};
const statusValues = {
  LOW: StatusValue.LOW,
  HIGH: StatusValue.HIGH,
  NORMAL: StatusValue.NORMAL,
  OPTIMUM: StatusValue.OPTIMUM,
} as const;

export const AnalysisPointDataList = ({ resultId }: { resultId: string }) => {
  const { t: tWidgets } = useTranslation("widgets");
  const rows: PointData[] =
    useAppSelector((state) => SelectAnalysisResultPointData(state, resultId)) ??
    [];
  const [hidden, setHidden] = useState<string[]>([]);
  const selectId = useId();
  useEffect(() => {
    setHidden([]);
  }, [resultId]);
  const sources = rows.flatMap((row) => [
    ...(row.displayReferences ?? []),
    ...(row.matchingIntervals ?? []).filter(
      (item) => item.status !== null && item.status !== undefined,
    ),
  ]);
  const roots = [
    ...new Map(
      sources.flatMap((item) =>
        item.source
          ? [[item.source.rootId, item.source.rootName] as const]
          : [],
      ),
    ).entries(),
  ];
  const hasCommon =
    sources.some((item) => item.sourceId === null) ||
    rows.some(
      (row) =>
        row.displayReferences === undefined ||
        (!row.displayReferences?.length &&
          !(row.matchingIntervals ?? []).some(
            (item) => item.status !== null && item.status !== undefined,
          )),
    );
  const options: SelectUIOption<string>[] = [
    ...(hasCommon
      ? [{ value: "common", label: "Без указанного источника" }]
      : []),
    ...roots.map(([id, name]) => ({ value: `source-${id}`, label: name })),
  ];
  const selected = options.filter((option) => !hidden.includes(option.value));
  const visible = (item: {
    sourceId: number | null;
    source: { rootId: number } | null;
  }) =>
    (item.sourceId === null ||
      (typeof item.sourceId === "number" &&
        item.source !== null &&
        item.source !== undefined)) &&
    !hidden.includes(filterKey(item));
  const selectedRows = rows.filter((row) => {
    if (row.displayReferences === undefined) return !hidden.includes("common");
    if (hasCommon && !hidden.includes("common")) return true;
    return [
      ...row.displayReferences,
      ...(row.matchingIntervals ?? []).filter(
        (item) => item.status !== null && item.status !== undefined,
      ),
    ].some(visible);
  });
  const tableData: TableData = {
    header: [
      { name: "name", label: tWidgets("analysisPointDataList.name") },
      { name: "interval", label: tWidgets("analysisPointDataList.interval") },
      { name: "value", label: tWidgets("analysisPointDataList.value") },
    ],
    rows: selectedRows.map((row): TableDataRow[] => {
      const referenceGroups = new Map<string, Reference[]>();
      for (const reference of (row.displayReferences ?? []).filter(visible)) {
        const key = sourceKey(reference);
        if (!referenceGroups.has(key)) referenceGroups.set(key, []);
        referenceGroups.get(key)!.push(reference);
      }
      const references = [...referenceGroups.values()].flatMap((group) =>
        group.sort(
          (a, b) =>
            Number(b.status === "OPTIMUM") - Number(a.status === "OPTIMUM"),
        ),
      );
      const statusSet = new Map<
        string,
        Map<NonNullable<Match["status"]>, Match>
      >();
      for (const item of (row.matchingIntervals ?? []).filter(
        (item) =>
          item.status !== null && item.status !== undefined && visible(item),
      )) {
        const key = sourceKey(item);
        if (!statusSet.has(key)) statusSet.set(key, new Map());
        statusSet.get(key)!.set(item.status!, item);
      }
      const statuses = [...statusSet.values()].flatMap((group) => {
        if (group.has("OPTIMUM")) group.delete("NORMAL");
        return [...group.entries()];
      });
      const abnormal =
        row.matchingIntervals === undefined
          ? row.pointDataStatus === StatusValue.HIGH ||
            row.pointDataStatus === StatusValue.LOW
          : statuses.some(([status]) => status === "HIGH" || status === "LOW");
      return [
        {
          name: "name",
          data: (
            <div>
              {row.point.translationRu}
              {row.isCalculated && (
                <span className="text-sm text-gray-500"> (расчётный)</span>
              )}
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
            row.displayReferences === undefined ? (
              row.minValue === null || row.maxValue === null ? (
                "Нет подходящего норматива"
              ) : (
                `${row.minValue} - ${row.maxValue} ${unitLabel(row.pointUnit.name, row.sourceUnitText)}`
              )
            ) : (
              <div className="divide-y divide-gray-300 dark:divide-gray-600">
                {references.map((ref) => {
                  const hasNormal = references.some(
                    (other) =>
                      sourceKey(other) === sourceKey(ref) &&
                      other.status === "NORMAL",
                  );
                  const hasOptimum = references.some(
                    (other) =>
                      sourceKey(other) === sourceKey(ref) &&
                      other.status === "OPTIMUM",
                  );
                  const label =
                    ref.status === "OPTIMUM"
                      ? " - Оптимум"
                      : hasNormal && hasOptimum
                        ? " - Норма"
                        : "";
                  return (
                    <div key={ref.id} className="py-2 first:pt-0 last:pb-0">
                      {intervalText(ref)}{" "}
                      {unitLabel(row.pointUnit.name, row.sourceUnitText)}
                      {label} {ref.source && <SourceInfo source={ref.source} />}
                    </div>
                  );
                })}
              </div>
            ),
        },
        {
          name: "value",
          data: (
            <span
              className={cn(
                "flex items-baseline",
                abnormal ? "font-bold" : "font-normal",
              )}
            >
              {`${row.displayValue ?? row.value} ${unitLabel(row.pointUnit.name, row.sourceUnitText)}`}
              &nbsp;
              {row.matchingIntervals === undefined ? (
                <AnalysisPointDataListStatus status={row.pointDataStatus} />
              ) : (
                statuses.map(([status, item], index) => (
                  <span key={`${sourceKey(item)}-${status}`}>
                    {index > 0 && ", "}
                    <AnalysisPointDataListStatus
                      status={statusValues[status]}
                    />{" "}
                    {item.source && <SourceInfo source={item.source} />}
                  </span>
                ))
              )}{" "}
              {row.calculation &&
                row.calculation.unitId !== row.pointUnit.id && (
                  <InfoPopover
                    label="Значение в расчётных единицах"
                    summary={`Для расчёта: ${row.calculation.value} ${unitLabel(row.calculation.unit)}`}
                  />
                )}
            </span>
          ),
        },
      ];
    }),
  };
  const selector =
    roots.length > 0 ? (
      <div>
        <label
          htmlFor="reference-sources"
          className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-100"
        >
          Источники референсов и статусов
        </label>
        <Select<SelectUIOption<string>, true>
          instanceId={selectId}
          inputId="reference-sources"
          isMulti
          closeMenuOnSelect={false}
          options={options}
          value={selected}
          onChange={(values) => {
            const selectedValues = new Set(values.map((item) => item.value));
            setHidden(
              options
                .filter((item) => !selectedValues.has(item.value))
                .map((item) => item.value),
            );
          }}
          placeholder="Выберите источники"
          noOptionsMessage={() => "Нет доступных источников"}
          menuPortalTarget={
            typeof document === "undefined" ? undefined : document.body
          }
          menuPosition="fixed"
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          classNames={{
            control: (state) =>
              `!min-h-10 !border !rounded-lg !bg-white dark:!bg-gray-950 !shadow-sm transition-all duration-200 ${state.isFocused ? "!border-cyan-800 !ring-1 !ring-cyan-800" : "!border-gray-300 hover:!border-cyan-800"}`,
            menu: () =>
              "!border !border-gray-200 !rounded-lg !shadow-lg !mt-1 !bg-white !overflow-hidden dark:!bg-gray-950 dark:!border-gray-600",
            option: (state) =>
              `!px-3 !py-2 !cursor-pointer ${state.isSelected ? "!bg-cyan-800 !text-white" : "!text-gray-700 dark:!text-gray-200 dark:!bg-gray-950 hover:!bg-gray-50"}`,
            multiValue: () => "!bg-cyan-50 dark:!bg-cyan-900 !rounded",
            multiValueLabel: () => "!text-cyan-900 dark:!text-white",
            multiValueRemove: () =>
              "!cursor-pointer hover:!bg-cyan-100 hover:!text-cyan-900 dark:hover:!bg-cyan-800 dark:hover:!text-white",
            clearIndicator: () => "!cursor-pointer",
          }}
        />
      </div>
    ) : undefined;
  return (
    <Table
      tableData={tableData}
      className="result-table"
      leadingContent={selector}
    />
  );
};
