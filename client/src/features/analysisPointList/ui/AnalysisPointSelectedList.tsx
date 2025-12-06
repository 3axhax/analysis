import { useAppSelector } from "@shared/store/hooks.ts";
import { AnalysisPointSelectedItem } from "@features/analysisPointList";
import { SelectAnalysisResultSelectedList } from "@entities/analysisResult";

export const AnalysisPointSelectedList = () => {
  const selectedList = useAppSelector(SelectAnalysisResultSelectedList);

  return (
    <>
      {selectedList.length > 0
        ? selectedList.map((pointId) => (
            <AnalysisPointSelectedItem key={pointId} pointId={pointId} />
          ))
        : null}
    </>
  );
};
