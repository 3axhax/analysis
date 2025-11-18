import { useTranslation } from "react-i18next";
import { AnalysisPointLimit } from "@entities/analysisPoint";
import { AnalysisPointDataLimitsEditableListItem } from "@features/Admin/analysisPoints/editAnalysisPoint/ui/AnalysisPointDataLimitsEditableListItem.tsx";
import { GenderType } from "@shared/lib/types";

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
        gender: "m",
        minValue: 0,
        maxValue: 0,
      },
    ]);
  };

  const deleteItemHandler = (i: number) => {
    onChange(limits.filter((_, index) => index !== i));
  };

  const editItemHandler = ({
    i,
    name,
    value,
  }: {
    i: number;
    name: keyof AnalysisPointLimit;
    value: number | string | GenderType;
  }) => {
    onChange(
      limits.map((limit, index) => {
        if (index === i) {
          return {
            ...limit,
            [name]: value,
          };
        }
        return limit;
      }),
    );
  };

  return (
    <>
      {limits.length > 0 &&
        limits.map((limit, i) => (
          <AnalysisPointDataLimitsEditableListItem
            key={i}
            limit={limit}
            deleteItemHandler={() => deleteItemHandler(i)}
            editItemHandler={({ name, value }) =>
              editItemHandler({ i, name, value })
            }
          />
        ))}
      <button className={"btn"} onClick={addLimitHandler}>
        {t("analysisPointData.addNewLimit")}
      </button>
    </>
  );
};
