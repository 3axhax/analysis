import { AnalysisPointLimit } from "@entities/analysisPoint";
import { AgeSelector } from "@features/ageSelector";
import { GenderSelector } from "@features/genderSelector";
import { InputWithLabel } from "@shared/ui/InputWithLabel";
import { UnitSelector } from "@features/unitSelector";

interface AnalysisPointDataLimitsEditableListItemProps {
  limit: AnalysisPointLimit;
}

export const AnalysisPointDataLimitsEditableListItem = ({
  limit,
}: AnalysisPointDataLimitsEditableListItemProps) => {
  return (
    <>
      <AgeSelector
        age={limit.age}
        setAge={(value) => {
          console.log("Age select", value);
        }}
      />
      <GenderSelector
        type={"list"}
        gender={limit.gender}
        setGender={(value) => {
          console.log("Gender select", value);
        }}
      />
      <InputWithLabel
        label={"Мин."}
        name={"minValue"}
        placeholder={"0"}
        onChange={(value) => {
          console.log("minValue", value);
        }}
        className={"justify-between"}
        value={limit.minValue}
      />
      <InputWithLabel
        label={"Макс."}
        name={"maxValue"}
        placeholder={"0"}
        onChange={(value) => {
          console.log("maxValue", value);
        }}
        className={"justify-between"}
        value={limit.maxValue}
      />
      <UnitSelector
        unit={limit.unit}
        setUnit={(value) => {
          console.log("Unit", value);
        }}
      />
    </>
  );
};
