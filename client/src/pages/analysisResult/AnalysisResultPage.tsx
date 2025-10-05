import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useParams } from "react-router-dom";
import { SelectAnalysisResultData } from "@entities/analysisResult";
import { useAnalysisResultsLoad } from "@entities/analysisResult/analysisResults.hooks.ts";

export const AnalysisResultPage = () => {
  const { resultId } = useParams();

  const title = `Результат ${resultId}`;
  useDocumentTitle(title);

  useAnalysisResultsLoad(resultId || "");
  const analysisResult = useAppSelector((state) =>
    SelectAnalysisResultData(state, resultId || ""),
  );

  console.log(analysisResult);

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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {analysisResult.resultId}
            </h2>
          </div>
        </div>
      ) : null}
    </div>
  );
};
