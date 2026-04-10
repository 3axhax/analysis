import { SelectUI } from "@shared/ui";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("entities");

  return (
    <SelectUI<number>
      label={label}
      name={"analysisPoint"}
      options={AnalysisPointsOptions.map((item) => ({
        ...item,
        label: t(`analysisPoint.${item.label}`),
      }))}
      value={analysisPoint}
      onChange={setAnalysisPoint}
      placeholder="Выберите тип анализа"
      className="min-w-[270px] mr-4"
    />
  );
};
