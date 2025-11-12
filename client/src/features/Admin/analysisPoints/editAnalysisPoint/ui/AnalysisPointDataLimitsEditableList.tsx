import { useTranslation } from "react-i18next";
import { AnalysisPointLimit } from "@entities/analysisPoint";
import { AnalysisPointDataLimitsEditableListItem } from "@features/Admin/analysisPoints/editAnalysisPoint/ui/AnalysisPointDataLimitsEditableListItem.tsx";

interface AnalysisPointDataLimitsEditableListProps {
  onChange: (value: AnalysisPointLimit[]) => void;
  limits: AnalysisPointLimit[];
}

export const AnalysisPointDataLimitsEditableList = ({
  onChange,
  limits,
}: AnalysisPointDataLimitsEditableListProps) => {
  const { t } = useTranslation("entities");

  const addLimitHandler = () => {
    onChange([
      ...limits,
      {
        age: "",
        unit: "",
        gender: "",
        minValue: 0,
        maxValue: 0,
      },
    ]);
  };

  return (
    <>
      {limits.length > 0 &&
        limits.map((limit, i) => (
          <AnalysisPointDataLimitsEditableListItem key={i} limit={limit} />
        ))}
      <button className={"btn"} onClick={addLimitHandler}>
        {t("analysisPointData.addNewLimit")}
      </button>
    </>
  );
};
