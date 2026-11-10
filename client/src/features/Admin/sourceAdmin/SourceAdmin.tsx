import React, { useEffect, useRef, useState } from "react";
import { parseBound } from "./parseBound";
import {
  AnalysisPointsFilters,
  initialPointFilters,
  type PointFilters,
} from "@features/Admin/analysisPoints/analysisPointsFilters";
import { DescriptionsFilters } from "@features/Admin/descriptions/descriptionsFilters";
import { DescriptionConditionsEditableListItem } from "@features/Admin/descriptions/editDescription/ui/DescriptionConditionsEditableListItem";
import { ReferenceLimitsTable } from "@widgets/Admin/analysisPointDataLimits";
import { ConditionsList } from "@widgets/Admin/descriptionsConditionsList";
import {
  AddButton,
  Modal,
  SelectUI,
  Table,
  TableActions,
  type TableData,
} from "@shared/ui";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { useTranslation } from "react-i18next";
import { unitLabel } from "@entities/units";
import Request from "@shared/transport/RestAPI";
import { useAppDispatch } from "@shared/store/hooks";
import { resetAdminView as resetPoints } from "@entities/analysisPoint/model/slice";
import { resetAdminView as resetDescriptions } from "@entities/descriptions/model/slice";

type Source = { id: number; parentId: number | null; name: string };
type Named = {
  id: number;
  name: string;
  translationRu?: string | null;
  translationEn?: string | null;
};
type Dictionary = {
  points: Named[];
  ages: Named[];
  genders: Named[];
  units: Named[];
  links: { pointId: number; unitsId: number }[];
};
type Bound = {
  ageId: number;
  genderId: number;
  unitId: number;
  minValue: number | string | null;
  maxValue: number | string | null;
  lowInclusive: boolean;
};
type PointRow = {
  sourceId: number;
  pointId: number;
  name: string;
  limits: Bound[];
};
type Mode = "own" | "inherited" | "both" | "unknown";
type Condition = { pointId: number; status: string; mode: Mode; name?: string };
type Description = {
  id?: number;
  sourceId: number;
  description: string;
  conditions: Condition[];
};
type PointOption = Named & {
  own: boolean;
  inheritable: boolean;
  inherited: boolean;
};
type Kind = "points" | "descriptions";

function documents(sources: Source[], groupId: number): Source[] {
  const parents = new Set([groupId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of sources)
      if (
        s.parentId !== null &&
        parents.has(s.parentId) &&
        !parents.has(s.id)
      ) {
        parents.add(s.id);
        changed = true;
      }
  }
  return sources.filter(
    (s) =>
      s.id !== groupId &&
      parents.has(s.id) &&
      !sources.some((child) => child.parentId === s.id),
  );
}

export function SourceContext({
  kind,
  children,
}: {
  kind: Kind;
  children: (
    open: boolean,
    setOpen: (open: boolean) => void,
  ) => React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("common");
  const { t: tFeatures } = useTranslation("features");
  const [sources, setSources] = useState<Source[]>([]);
  const [group, setGroup] = useState(0);
  const [open, setOpen] = useState(false);
  const [pointFilters, setPointFilters] =
    useState<PointFilters>(initialPointFilters);
  const [descriptionPoint, setDescriptionPoint] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    Request.get("/admin/medical-sources")
      .then((r) => setSources(r.data))
      .catch(() => setError("Не удалось загрузить источники"));
  }, []);
  const add = () => setOpen(true);
  return (
    <>
      <div className="p-4 max-w-xl">
        <SelectUI<number>
          label="Источник данных"
          name={`source-${kind}`}
          value={group}
          options={[
            { value: 0, label: "Без источников" },
            ...sources
              .filter((s) => s.parentId === null)
              .map((s) => ({ value: s.id, label: s.name })),
          ]}
          onChange={(value) => {
            setOpen(false);
            setPointFilters(initialPointFilters);
            setDescriptionPoint(0);
            dispatch(kind === "points" ? resetPoints() : resetDescriptions());
            setGroup(value);
          }}
        />
      </div>
      {error && (
        <p role="alert" className="text-red-700 p-4">
          {error}
        </p>
      )}
      <div className="relative">
        <h1 className="p-4 text-3xl">
          {t(
            kind === "points"
              ? "pageTitle.analysisPoints"
              : "pageTitle.descriptions",
          )}
        </h1>
        <AddButton
          className="absolute right-[5%] top-[calc(50%-20px)]"
          title={tFeatures("editDialog.add")}
          onClick={add}
        />
      </div>
      {kind === "points" ? (
        <AnalysisPointsFilters
          key={`filters-${kind}-${group}`}
          onApply={group === 0 ? undefined : setPointFilters}
        />
      ) : (
        <DescriptionsFilters
          key={`filters-${kind}-${group}`}
          onApply={group === 0 ? undefined : setDescriptionPoint}
        />
      )}
      {group === 0 ? (
        <React.Fragment key="common">{children(open, setOpen)}</React.Fragment>
      ) : (
        <SourcePanel
          key={`${kind}-${group}`}
          kind={kind}
          group={group}
          sources={sources}
          open={open}
          setOpen={setOpen}
          pointFilters={pointFilters}
          descriptionPoint={descriptionPoint}
        />
      )}
      <AddButton
        className="my-4 xl:sticky xl:bottom-5 xl:mr-[5%] xl:ml-auto flex"
        title={tFeatures("editDialog.add")}
        onClick={add}
      />
    </>
  );
}

function SourcePanel({
  kind,
  group,
  sources,
  open,
  setOpen,
  pointFilters,
  descriptionPoint,
}: {
  kind: Kind;
  group: number;
  sources: Source[];
  open: boolean;
  setOpen: (open: boolean) => void;
  pointFilters: PointFilters;
  descriptionPoint: number;
}) {
  const { t } = useTranslation("entities");
  const { openModal: openConfirmation } = useInfoModalData();
  const docs = documents(sources, group);
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [rows, setRows] = useState<PointRow[]>([]);
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [point, setPoint] = useState<PointRow | null>(null);
  const [description, setDescription] = useState<Description | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [originalSourceId, setOriginalSourceId] = useState(0);
  const [options, setOptions] = useState<PointOption[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pointMetadata, setPointMetadata] = useState<Named[]>([]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!open || point || description) return;
    setIsNew(true);
    if (kind === "points")
      setPoint({
        sourceId: 0,
        pointId: 0,
        name: "",
        limits: [
          {
            ageId: 0,
            genderId: 0,
            unitId: 0,
            minValue: null,
            maxValue: null,
            lowInclusive: false,
          },
        ],
      });
    else setDescription({ sourceId: 0, description: "", conditions: [] });
  }, [open, kind, point, description]);
  const docName = (id: number) =>
    docs.find((d) => d.id === id)?.name || `Документ ${id}`;
  const load = async () => {
    const response = await Request.get(
      `/admin/medical-sources/groups/${group}/${kind}`,
    );
    if (kind === "points") setRows(response.data);
    else setDescriptions(response.data);
  };
  useEffect(() => {
    Promise.all([
      Request.get("/admin/medical-sources/dictionaries"),
      Request.get(`/admin/medical-sources/groups/${group}/${kind}`),
      kind === "points"
        ? Request.get("/analysisPoint")
        : Promise.resolve({ data: [] }),
    ])
      .then(([d, list, metadata]) => {
        setDict(d.data);
        setPointMetadata(metadata.data);
        if (kind === "points") setRows(list.data);
        else setDescriptions(list.data);
      })
      .catch(() => setError("Не удалось загрузить данные источника"));
  }, [group, kind]);
  const selectedDocument = description?.sourceId || 0;
  useEffect(() => {
    setOptions([]);
    if (!selectedDocument) return;
    let active = true;
    Request.get(`/admin/medical-sources/${selectedDocument}/points`)
      .then((r) => {
        if (active) setOptions(r.data);
      })
      .catch(() => {
        if (active) setError("Не удалось загрузить параметры документа");
      });
    return () => {
      active = false;
    };
  }, [selectedDocument]);
  const perform = async (path: string, body: object) => {
    setBusy(true);
    setError("");
    try {
      await Request.post(path, body);
      if (!mounted.current) return;
      setOpen(false);
      setPoint(null);
      setDescription(null);
      await load();
    } catch {
      if (mounted.current)
        setError(
          "Не удалось сохранить изменение. Проверьте документ, условия и границы.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  const emptyBound = (): Bound => ({
    ageId: 0,
    genderId: 0,
    unitId: 0,
    minValue: null,
    maxValue: null,
    lowInclusive: false,
  });
  const changeBound = (index: number, patch: Partial<Bound>) =>
    point &&
    setPoint({
      ...point,
      limits: point.limits.map((l, i) =>
        i === index ? { ...l, ...patch } : l,
      ),
    });
  const changeCondition = (index: number, patch: Partial<Condition>) =>
    description &&
    setDescription({
      ...description,
      conditions: description.conditions.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    });
  const selection = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    entries: Named[],
    disabled = false,
  ) =>
    disabled ? (
      <div className="min-w-[200px]">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-100">
          {label}
        </span>
        <div className="form-control">
          {entries.find((entry) => entry.id === value)?.translationRu ||
            entries.find((entry) => entry.id === value)?.name}
        </div>
      </div>
    ) : (
      <SelectUI<number>
        className="min-w-[200px]"
        label={label}
        name={`${label}-${value}`}
        value={value}
        onChange={onChange}
        placeholder="Выберите"
        options={entries.map((entry) => ({
          value: entry.id,
          label: entry.translationRu || entry.name,
        }))}
      />
    );
  const documentSelection = (
    value: number,
    onChange: (id: number) => void,
    disabled = false,
  ) => selection("Документ источника", value, onChange, docs, disabled);
  return (
    <section className="p-4 space-y-4">
      {error && !point && !description && (
        <p role="alert" className="bg-red-100 p-3">
          {error}
        </p>
      )}
      {!docs.length && <p>В группе нет документов.</p>}
      <Table
        className="max-w-[90%]"
        tableData={
          kind === "points"
            ? {
                header: [
                  {
                    name: "point",
                    label: "Параметр",
                    className: "min-w-[200px]",
                  },
                  {
                    name: "document",
                    label: "Документ",
                    className: "min-w-[200px]",
                  },
                  {
                    name: "limits",
                    label: "Нормативы",
                    className: "min-w-[200px]",
                  },
                  { name: "action", label: "Действия" },
                ],
                rows: rows
                  .filter((row) => {
                    const point = pointMetadata.find(
                      (item) => item.id === row.pointId,
                    );
                    const contains = (
                      value: string | null | undefined,
                      query: string,
                    ) =>
                      !query ||
                      (value ?? "")
                        .toLocaleLowerCase()
                        .includes(query.toLocaleLowerCase());
                    return (
                      contains(point?.name, pointFilters.name) &&
                      contains(
                        point?.translationRu,
                        pointFilters.translationRu,
                      ) &&
                      contains(point?.translationEn, pointFilters.translationEn)
                    );
                  })
                  .map((row) => [
                    { name: "point", data: row.name },
                    { name: "document", data: docName(row.sourceId) },
                    {
                      name: "limits",
                      className: "text-start",
                      data: (
                        <ReferenceLimitsTable
                          limits={row.limits.map((limit) => ({
                            age:
                              dict?.ages.find((age) => age.id === limit.ageId)
                                ?.name ?? String(limit.ageId),
                            gender:
                              dict?.genders.find(
                                (gender) => gender.id === limit.genderId,
                              )?.name ?? String(limit.genderId),
                            unit:
                              dict?.units.find(
                                (unit) => unit.id === limit.unitId,
                              )?.name ?? "",
                            minValue: limit.minValue,
                            maxValue: limit.maxValue,
                            lowInclusive: limit.lowInclusive,
                          }))}
                        />
                      ),
                    },
                    {
                      name: "action",
                      className: "text-center",
                      data: (
                        <TableActions
                          onEdit={() => {
                            setIsNew(false);
                            setOriginalSourceId(row.sourceId);
                            setPoint(structuredClone(row));
                            setOpen(true);
                          }}
                          onDelete={() =>
                            openConfirmation({
                              type: "danger",
                              title:
                                "Удалить нормативы документа? Связанные описания могут перестать срабатывать.",
                              onAccess: () => {
                                void perform(
                                  "/admin/medical-sources/points/delete",
                                  {
                                    sourceId: row.sourceId,
                                    pointId: row.pointId,
                                  },
                                );
                              },
                            })
                          }
                        />
                      ),
                    },
                  ]),
              }
            : ({
                header: [
                  { name: "id", label: "ID" },
                  {
                    name: "description",
                    label: "Описание на RU",
                    className: "min-w-[300px]",
                  },
                  {
                    name: "document",
                    label: "Документ",
                    className: "min-w-[200px]",
                  },
                  {
                    name: "conditions",
                    label: "Условия применения",
                    className: "min-w-[200px]",
                  },
                  { name: "action", label: "Действия" },
                ],
                rows: descriptions
                  .filter(
                    (row) =>
                      !descriptionPoint ||
                      row.conditions.some(
                        (condition) => condition.pointId === descriptionPoint,
                      ),
                  )
                  .map((row) => [
                    { name: "id", data: String(row.id) },
                    { name: "description", data: row.description },
                    { name: "document", data: docName(row.sourceId) },
                    {
                      name: "conditions",
                      data: (
                        <ConditionsList
                          conditions={row.conditions.map((condition) => ({
                            name: condition.name || "",
                            status: condition.status,
                          }))}
                        />
                      ),
                    },
                    {
                      name: "action",
                      className: "text-center",
                      data: (
                        <TableActions
                          onEdit={() => {
                            setIsNew(false);
                            setOriginalSourceId(row.sourceId);
                            setDescription(structuredClone(row));
                            setOpen(true);
                          }}
                          onDelete={() =>
                            openConfirmation({
                              type: "danger",
                              title: "Удалить описание документа?",
                              onAccess: () => {
                                void perform(
                                  "/admin/medical-sources/descriptions/delete",
                                  { sourceId: row.sourceId, id: row.id },
                                );
                              },
                            })
                          }
                        />
                      ),
                    },
                  ]),
              } satisfies TableData)
        }
      />
      <Modal
        open={!!(point || description)}
        setOpen={(open) => {
          if (!open) {
            setOpen(false);
            setPoint(null);
            setDescription(null);
            setError("");
          }
        }}
        title={`${isNew ? "Добавить" : "Изменить"} ${point ? "нормативы параметра" : "описание результатов"}`}
        className={
          point ? "!w-[95vw] !max-w-[1200px]" : "!w-[95vw] !max-w-[800px]"
        }
        layerClassName="z-[100]"
        hasButtons={false}
        body={
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            {point && dict && (
              <>
                {documentSelection(point.sourceId, (sourceId) =>
                  setPoint({ ...point, sourceId }),
                )}
                {selection(
                  "Параметр",
                  point.pointId,
                  (pointId) =>
                    setPoint({ ...point, pointId, limits: [emptyBound()] }),
                  dict.points,
                  !isNew,
                )}
                {point.limits.map((limit, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-end justify-between gap-2 line-between pb-3"
                  >
                    {selection(
                      "Возраст",
                      limit.ageId,
                      (ageId) => changeBound(i, { ageId }),
                      dict.ages.map((age) => ({
                        ...age,
                        translationRu: t(`ages.${age.name}`),
                      })),
                    )}
                    {selection(
                      "Пол",
                      limit.genderId,
                      (genderId) => changeBound(i, { genderId }),
                      dict.genders.map((gender) => ({
                        ...gender,
                        translationRu: t(`gender.${gender.name}`),
                      })),
                    )}
                    <label>
                      Мин.
                      <input
                        className="form-control"
                        type="text"
                        inputMode="decimal"
                        value={limit.minValue ?? ""}
                        onChange={(e) =>
                          changeBound(i, {
                            minValue: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      Макс.
                      <input
                        className="form-control"
                        type="text"
                        inputMode="decimal"
                        value={limit.maxValue ?? ""}
                        onChange={(e) =>
                          changeBound(i, {
                            maxValue: e.target.value,
                          })
                        }
                      />
                    </label>
                    {selection(
                      "Единица",
                      limit.unitId,
                      (unitId) => changeBound(i, { unitId }),
                      dict.units
                        .filter((u) =>
                          dict.links.some(
                            (x) =>
                              x.pointId === point.pointId && x.unitsId === u.id,
                          ),
                        )
                        .map((unit) => ({
                          ...unit,
                          translationRu: unitLabel(unit.name),
                        })),
                    )}
                    <button
                      type="button"
                      aria-label="Удалить интервал"
                      className="w-7 h-7 flex text-red-600 cursor-pointer hover:text-red-700 transition-colors"
                      onClick={() =>
                        setPoint({
                          ...point,
                          limits: point.limits.filter((_, n) => n !== i),
                        })
                      }
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <label className="basis-full text-left">
                      <input
                        type="checkbox"
                        checked={limit.lowInclusive}
                        onChange={(e) =>
                          changeBound(i, { lowInclusive: e.target.checked })
                        }
                      />{" "}
                      Значение, равное минимуму, считается пониженным
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    setPoint({
                      ...point,
                      limits: [...point.limits, emptyBound()],
                    })
                  }
                >
                  <PlusCircleIcon className="h-5 w-5 inline-flex mr-2" />
                  Добавить интервал
                </button>
              </>
            )}
            {description && (
              <>
                {documentSelection(description.sourceId, (sourceId) =>
                  setDescription({ ...description, sourceId }),
                )}
                <label className="block">
                  Описание
                  <textarea
                    className="form-control w-full"
                    rows={5}
                    value={description.description}
                    onChange={(e) =>
                      setDescription({
                        ...description,
                        description: e.target.value,
                      })
                    }
                  />
                </label>
                {description.conditions.map((condition, i) => {
                  const available = options.filter((p) =>
                    condition.mode === "own" || condition.mode === "both"
                      ? p.own
                      : condition.mode === "inherited"
                        ? p.inheritable
                        : p.id === condition.pointId,
                  );
                  const choices = available.map((p) => ({
                    value: p.id,
                    label: p.translationRu || p.name,
                  }));
                  if (
                    condition.pointId &&
                    !choices.some((item) => item.value === condition.pointId)
                  )
                    choices.push({
                      value: condition.pointId,
                      label: `${condition.name || condition.pointId} (нет норматива)`,
                    });
                  return (
                    <DescriptionConditionsEditableListItem
                      key={i}
                      serialNumber={i}
                      condition={{
                        analysisPoint: {
                          id: condition.pointId,
                          name: condition.name || "",
                        },
                        status: condition.status,
                      }}
                      source={{
                        mode: condition.mode,
                        options: choices,
                        onModeChange: (mode) =>
                          changeCondition(i, { mode, pointId: 0 }),
                      }}
                      editItemHandler={({ name, value }) => {
                        if (
                          name === "analysisPoint" &&
                          typeof value === "object"
                        )
                          changeCondition(i, { pointId: value.id });
                        else if (name === "status" && typeof value === "string")
                          changeCondition(i, { status: value });
                      }}
                      deleteItemHandler={() =>
                        setDescription({
                          ...description,
                          conditions: description.conditions.filter(
                            (_, n) => n !== i,
                          ),
                        })
                      }
                    />
                  );
                })}
                <button
                  type="button"
                  className="btn"
                  disabled={!description.sourceId}
                  onClick={() =>
                    setDescription({
                      ...description,
                      conditions: [
                        ...description.conditions,
                        { pointId: 0, status: "", mode: "own" },
                      ],
                    })
                  }
                >
                  <PlusCircleIcon className="h-5 w-5 inline-flex mr-2" />
                  Добавить новое условие
                </button>
                <p className="text-sm">
                  Собственные нормативы документа имеют приоритет над
                  наследованными для соответствующих возраста и пола.
                </p>
              </>
            )}
            {error && (
              <p role="alert" className="text-red-700">
                {error}
              </p>
            )}
            <div className="bg-gray-50 py-3 flex items-center flex-row-reverse gap-2 px-6 border-t border-gray-200">
              <button
                type="button"
                className="btn-white cursor-pointer inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold"
                onClick={() => {
                  setOpen(false);
                  setPoint(null);
                  setDescription(null);
                  setError("");
                }}
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={() => {
                  if (point) {
                    let limits: Bound[];
                    try {
                      limits = point.limits.map((limit) => ({
                        ...limit,
                        minValue: parseBound(limit.minValue),
                        maxValue: parseBound(limit.maxValue),
                      }));
                    } catch {
                      setError(
                        "Введите числовые границы через точку или запятую.",
                      );
                      return;
                    }
                    void perform("/admin/medical-sources/points/save", {
                      sourceId: point.sourceId,
                      originalSourceId: isNew
                        ? point.sourceId
                        : originalSourceId,
                      groupId: group,
                      pointId: point.pointId,
                      limits,
                      create: isNew,
                    });
                  } else if (description)
                    void perform("/admin/medical-sources/descriptions/save", {
                      ...description,
                      originalSourceId: isNew
                        ? description.sourceId
                        : originalSourceId,
                      groupId: group,
                    });
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        }
      />
    </section>
  );
}
