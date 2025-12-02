import SelectUI from "@shared/ui/SelectUI.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import {
  selectAnalysisPointListForSelect,
  useAnalysisPointsLoad,
} from "@entities/analysisPoint";

interface AnalysisPointsSelectorProps {
  analysisPoint: number;
  setAnalysisPoint: (value: number) => void;
}

export const AnalysisPointsSelector = ({
  analysisPoint,
  setAnalysisPoint,
}: AnalysisPointsSelectorProps) => {
  const AnalysisPointsOptions = useAppSelector(
    selectAnalysisPointListForSelect,
  );
  useAnalysisPointsLoad();
  const { t } = useTranslation("entities");

  return (
    <SelectUI<number>
      label={"Параметр"}
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
