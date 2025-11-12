import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAnalysisPointSelectedList } from "@entities/analysisPoint";
import { AnalysisPointSelectedItem } from "@features/analysisPointList";

export const AnalysisPointSelectedList = () => {
  const analysisPointSelectedList = useAppSelector(
    selectAnalysisPointSelectedList,
  );

  return (
    <>
      {analysisPointSelectedList.length > 0
        ? analysisPointSelectedList.map((pointId) => (
            <AnalysisPointSelectedItem key={pointId} pointId={pointId} />
          ))
        : null}
    </>
  );
};
