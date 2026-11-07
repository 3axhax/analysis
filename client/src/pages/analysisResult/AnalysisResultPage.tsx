import { useAppSelector } from "@shared/store/hooks.ts";
import { useParams } from "react-router-dom";
import { SelectAnalysisResultData } from "@entities/analysisResult";
import { useAnalysisResultsLoad } from "@entities/analysisResult/analysisResults.hooks.ts";
import { AnalysisDescriptionList } from "@widgets/analysisDescriptionList";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  LinkIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useId, useState } from "react";
import Select from "react-select";
import type { SelectUIOption } from "@shared/ui/SelectUI.tsx";
import { convertDaysToAge } from "@entities/ages";

export const AnalysisResultPage = () => {
  const { resultId } = useParams();
  const sourceSelectId = useId();
  const [copied, setCopied] = useState(false);
  const [hiddenRoots, setHiddenRoots] = useState<number[]>([]);
  const [hideCommon, setHideCommon] = useState(false);
  const { t } = useTranslation();
  const { t: tEntities } = useTranslation("entities");

  const title = `Результат расшифровки`;

  useAnalysisResultsLoad(resultId || "");
  const analysisResult = useAppSelector((state) =>
    SelectAnalysisResultData(state, resultId || ""),
  );

  const sourceGroups = analysisResult?.sourceDescriptions ?? [];
  const roots = [
    ...new Map(
      sourceGroups.map((group) => [group.source.rootId, group.source.rootName]),
    ).entries(),
  ];
  const sourceOptions: SelectUIOption<string>[] = [
    ...(analysisResult?.descriptions.length
      ? [{ value: "common", label: "Без указанного источника" }]
      : []),
    ...roots.map(([id, name]) => ({ value: `source-${id}`, label: name })),
  ];
  const selectedSources = sourceOptions.filter((option) =>
    option.value === "common"
      ? !hideCommon
      : !hiddenRoots.includes(Number(option.value.slice(7))),
  );

  const handleCopy = async () => {
    const currentUrl = window.location.href;
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app">
      <h1 className="text-2xl lg:text-4xl font-light text-gray-900 dark:text-white mb-4">
        {title}
        <button
          type={"button"}
          onClick={handleCopy}
          title="Скопировать ссылку на результатврасшифровки ${resultId}"
          className={"size-6 cursor-pointer ml-2"}
        >
          {copied ? (
            <CheckIcon className="size-6 inline-flex mx-1 text-green-600" />
          ) : (
            <LinkIcon
              className={
                "size-6 inline-flex mx-1 text-gray-500 hover:text-gray-700 dark:text-gray-100 dark:hover:dark:text-gray-300 transition-colors"
              }
            />
          )}
        </button>
      </h1>
      {analysisResult ? (
        <div className="mx-auto mb-8 w-full lg:w-10/12 bg-white dark:bg-cyan-950 rounded-xl lg:p-8 shadow-xl text-left">
          <div
            className={
              "flex gap-3 py-2 border-1 border-b-0 border-cyan-800 dark:border-white justify-center"
            }
          >
            <span className={"text-gray-600 dark:text-gray-300"}>
              {t("gender")}:{" "}
            </span>
            {tEntities(`gender.${analysisResult.result.Gender.name}`)}
            <span className={"text-gray-600 dark:text-gray-300"}>
              {t("age")}:{" "}
            </span>
            {convertDaysToAge(analysisResult.result.ageInDays)}
          </div>

          {analysisResult.result.analysisResultPointData.length > 0 && (
            <AnalysisPointDataList resultId={analysisResult.resultId} />
          )}
          {(analysisResult.descriptions.length > 0 ||
            sourceGroups.length > 0) && (
            <>
              <h2 className={"text-xl my-6 text-center"}>Интерпретация</h2>

              <div className="w-full overflow-hidden bg-orange-600 py-3">
                <div className="animate-[scroll_25s_linear_infinite] transition-all whitespace-nowrap text-white">
                  <span className="mx-4 font-bold">
                    <ExclamationCircleIcon
                      className={"size-5 inline-flex mr-2"}
                    />
                    Внимание!
                  </span>
                  <span className="mx-4">
                    Данная расшифровка носит исключительно ознакомительный
                    характер.
                  </span>
                  <span className="mx-4">
                    Не является медицинским диагнозом.
                  </span>
                  <span className="mx-4">
                    Не заменяет прием медицинского специалиста.
                  </span>
                </div>
              </div>
              {roots.length > 0 && (
                <div className="my-4">
                  <label
                    htmlFor="result-sources"
                    className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-100"
                  >
                    Источники интерпретаций
                  </label>
                  <Select<SelectUIOption<string>, true>
                    instanceId={sourceSelectId}
                    inputId="result-sources"
                    isMulti
                    closeMenuOnSelect={false}
                    options={sourceOptions}
                    value={selectedSources}
                    onChange={(selected) => {
                      const values = new Set(
                        selected.map((option) => option.value),
                      );
                      setHideCommon(!values.has("common"));
                      setHiddenRoots(
                        roots
                          .filter(([id]) => !values.has(`source-${id}`))
                          .map(([id]) => id),
                      );
                    }}
                    placeholder="Выберите источники"
                    noOptionsMessage={() => "Нет доступных источников"}
                    menuPortalTarget={
                      typeof document === "undefined"
                        ? undefined
                        : document.body
                    }
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    classNames={{
                      control: (state) =>
                        `!min-h-10 !border !rounded-lg !bg-white dark:!bg-gray-950 !shadow-sm transition-all duration-200 ${state.isFocused ? "!border-cyan-800 !ring-1 !ring-cyan-800" : "!border-gray-300 hover:!border-cyan-800"}`,
                      menu: () =>
                        "!border !border-gray-200 !rounded-lg !shadow-lg !mt-1 !bg-white !overflow-hidden dark:!bg-gray-950 dark:!border-gray-600",
                      option: (state) =>
                        `!px-3 !py-2 !cursor-pointer ${state.isSelected ? "!bg-cyan-800 !text-white" : "!text-gray-700 dark:!text-gray-200 dark:!bg-gray-950 hover:!bg-gray-50"}`,
                      multiValue: () =>
                        "!bg-cyan-50 dark:!bg-cyan-900 !rounded",
                      multiValueLabel: () => "!text-cyan-900 dark:!text-white",
                    }}
                  />
                </div>
              )}
              <AnalysisDescriptionList
                descriptions={hideCommon ? [] : analysisResult.descriptions}
                sourceGroups={sourceGroups.filter(
                  (group) => !hiddenRoots.includes(group.source.rootId),
                )}
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};
