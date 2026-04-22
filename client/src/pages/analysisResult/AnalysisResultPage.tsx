import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useParams } from "react-router-dom";
import { SelectAnalysisResultData } from "@entities/analysisResult";
import { useAnalysisResultsLoad } from "@entities/analysisResult/analysisResults.hooks.ts";
import { AnalysisDescriptionList } from "@widgets/analysisDescriptionList";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList";
import { useTranslation } from "react-i18next";
import {CheckIcon, LinkIcon, ExclamationCircleIcon} from "@heroicons/react/24/outline";
import {useState} from "react";

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
        <button type={'button'} onClick={handleCopy} title="Скопировать ссылку на результатврасшифровки ${resultId}" className={'size-6 cursor-pointer ml-2'}>
          {copied ? (
              <CheckIcon className="size-6 inline-flex mx-1 text-green-600" />
          ) : (
              <LinkIcon className={'size-6 inline-flex mx-1 text-gray-500 hover:text-gray-700 transition-colors'} />
          )}
        </button>
      </h1>
      {analysisResult ? (
        <div className="mx-auto mb-8 w-10/12 bg-white dark:bg-blue-950 rounded-xl p-8 shadow-lg text-left">
            <div className={"flex gap-3 mb-2 border-b-1 border-gray-300 justify-center"}>
              <span className={'text-gray-600'}>{t("gender")}:{" "}</span>
                {tEntities(`gender.${analysisResult.result.Gender.name}`)}
                <span className={'text-gray-600'}>{t("age")}:{" "}</span>
                  {tEntities(`ages.${analysisResult.result.Age.name}`)}
            </div>

            {analysisResult.result.analysisResultPointData.length > 0 && (
              <AnalysisPointDataList resultId={analysisResult.resultId} />
            )}
            {analysisResult.descriptions.length > 0 && (
                <>
                  <h2 className={'text-xl my-6 text-center'}>Интерпретация</h2>

                  <div className="w-full overflow-hidden bg-orange-600 py-3">
                    <div className="animate-[scroll_25s_linear_infinite] whitespace-nowrap text-white">
                      <span className="mx-4 font-bold">
                          <ExclamationCircleIcon className={'size-5 inline-flex mr-2'}/>
                          Внимание!
                      </span>
                      <span className="mx-4">
                        Данная расшифровка носит исключительно ознакомительный характер.
                      </span>
                      <span className="mx-4">
                          Не является медицинским диагнозом.
                      </span>
                      <span className="mx-4">
                          Не заменяет прием медицинского специалиста.
                      </span>
                    </div>
                  </div>
                  <AnalysisDescriptionList resultId={analysisResult.resultId}/>
                </>
            )}
        </div>
      ) : null}
    </div>
  );
};
