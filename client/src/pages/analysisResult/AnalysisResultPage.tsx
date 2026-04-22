import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useParams } from "react-router-dom";
import { SelectAnalysisResultData } from "@entities/analysisResult";
import { useAnalysisResultsLoad } from "@entities/analysisResult/analysisResults.hooks.ts";
import { AnalysisDescriptionList } from "@widgets/analysisDescriptionList";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList";
import { useTranslation } from "react-i18next";
import { CheckIcon, LinkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export const AnalysisResultPage = () => {
  const { resultId } = useParams();
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  const { t: tEntities } = useTranslation("entities");

  const title = `Результат расшифровки`;
  useDocumentTitle(title);

  useAnalysisResultsLoad(resultId || "");
  const analysisResult = useAppSelector((state) =>
    SelectAnalysisResultData(state, resultId || ""),
  );

  const handleCopy = async () => {
    const currentUrl = window.location.href;
    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app">
      <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-4">
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
                "size-6 inline-flex mx-1 text-gray-500 hover:text-gray-700 transition-colors"
              }
            />
          )}
        </button>
      </h1>
      {analysisResult ? (
        <div className="mx-auto text-left">
          <div className="bg-white dark:bg-blue-950 rounded-xl p-8 shadow-lg">
            <div className={"flex gap-3 mb-2 border-b-1 border-gray-300"}>
              <span className={"text-gray-600"}>{t("gender")}: </span>
              {tEntities(`gender.${analysisResult.result.Gender.name}`)}
              <span className={"text-gray-600"}>{t("age")}: </span>
              {tEntities(`ages.${analysisResult.result.Age.name}`)}
            </div>
            {analysisResult.descriptions.length > 0 && (
              <AnalysisDescriptionList
                resultId={analysisResult.resultId}
                className={"mb-4"}
              />
            )}
            {analysisResult.result.analysisResultPointData.length > 0 && (
              <AnalysisPointDataList resultId={analysisResult.resultId} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
