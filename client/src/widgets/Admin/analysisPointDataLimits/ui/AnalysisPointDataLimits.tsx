import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAnalysisPointLimits } from "@entities/analysisPoint";
import { ReferenceLimitsTable } from "./ReferenceLimitsTable";

export const AnalysisPointDataLimits = ({
  analysisPointId,
}: {
  analysisPointId: number;
}) => {
  const limits = useAppSelector((state) =>
    selectAnalysisPointLimits(state, analysisPointId),
  );
  return <ReferenceLimitsTable limits={limits} />;
};
