import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useParams } from "react-router-dom";
import { SelectAnalysisResultData } from "@entities/analysisResult";
import { useAnalysisResultsLoad } from "@entities/analysisResult/analysisResults.hooks.ts";
import { AnalysisDescriptionList } from "@widgets/analysisDescriptionList";
import { AnalysisPointDataList } from "@widgets/analysisPointdataList";
import { useTranslation } from "react-i18next";

export const AnalysisResultPage = () => {
  const { resultId } = useParams();
  const { t } = useTranslation();
  const { t: tEntities } = useTranslation("entities");

  const title = `Результат ${resultId}`;
  useDocumentTitle(title);

  useAnalysisResultsLoad(resultId || "");
  const analysisResult = useAppSelector((state) =>
    SelectAnalysisResultData(state, resultId || ""),
  );

  return (
    <div className="app">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>
      </div>
      {analysisResult ? (
        <div className="mx-auto text-left">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <div className={"flex gap-3 mb-2 border-b-1 border-gray-300"}>
              <div>
                {t("gender")}:{" "}
                {tEntities(`gender.${analysisResult.result.Gender.name}`)}
              </div>
              <div>
                {t("age")}:{" "}
                {tEntities(`ages.${analysisResult.result.Age.name}`)}
              </div>
            </div>
            {analysisResult.descriptions.length > 0 &&
            <AnalysisDescriptionList
              resultId={analysisResult.resultId}
              className={"mb-4"}
            />
            }
            {analysisResult.result.analysisResultPointData.length > 0 &&
            <AnalysisPointDataList resultId={analysisResult.resultId} />
            }
          </div>
        </div>
      ) : null}
    </div>
  );
};
