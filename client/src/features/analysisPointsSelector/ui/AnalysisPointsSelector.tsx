import { SelectUI } from "@shared/ui";
import { useAppSelector } from "@shared/store/hooks.ts";
import {
  selectAnalysisPointListForSelect,
  useAnalysisPointsLoad,
} from "@entities/analysisPoint";

interface AnalysisPointsSelectorProps {
  analysisPoint: number;
  setAnalysisPoint: (value: number) => void;
  label?: string;
}

export const AnalysisPointsSelector = ({
  analysisPoint,
  setAnalysisPoint,
  label,
}: AnalysisPointsSelectorProps) => {
  const AnalysisPointsOptions = useAppSelector(
    selectAnalysisPointListForSelect,
  );
  useAnalysisPointsLoad();

  return (
    <SelectUI<number>
      label={label}
      name={"analysisPoint"}
      options={AnalysisPointsOptions}
      value={analysisPoint}
      onChange={setAnalysisPoint}
      placeholder="Выберите тип анализа"
      className="min-w-[270px] mr-4"
    />
  );
};
