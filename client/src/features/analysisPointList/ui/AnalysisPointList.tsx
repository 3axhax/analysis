import { useAnalysisTypeLoad } from "@entities/analysisType";
import { useAnalysisPointsLoad } from "@entities/analysisPoint";
import { AnalysisPointSelectedList } from "@features/analysisPointList";
import { AnalysisPointGroupSelect } from "@features/analysisPointList/ui/AnalysisPointGroupSelect.tsx";

export const AnalysisPointList = () => {
  useAnalysisTypeLoad();
  useAnalysisPointsLoad();

  return (
    <>
      <AnalysisPointGroupSelect />
      <AnalysisPointSelectedList />
    </>
  );
};
