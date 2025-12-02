import { AnalysisPointLimit } from "@entities/analysisPoint";
import { AgeSelector } from "@features/ageSelector";
import { GenderSelector } from "@features/genderSelector";
import { InputWithLabel } from "@shared/ui/InputWithLabel";
import { UnitSelector } from "@features/unitSelector";
import { TrashIcon } from "@heroicons/react/16/solid";
import { GenderType } from "@shared/lib/types";

interface AnalysisPointDataLimitsEditableListItemProps {
  limit: AnalysisPointLimit;
  deleteItemHandler: () => void;
  editItemHandler: ({
    name,
    value,
  }: {
    name: keyof AnalysisPointLimit;
    value: string | number | GenderType;
  }) => void;
}

export const AnalysisPointDataLimitsEditableListItem = ({
  limit,
  deleteItemHandler,
  editItemHandler,
}: AnalysisPointDataLimitsEditableListItemProps) => {
  return (
    <div className={"flex items-center"}>
      <AgeSelector
        age={limit.age}
        setAge={(value) => editItemHandler({ name: "age", value })}
      />
      <GenderSelector
        type={"list"}
        gender={limit.gender}
        setGender={(value) => editItemHandler({ name: "gender", value })}
      />
      <InputWithLabel
        label={"Мин."}
        name={"minValue"}
        placeholder={"0"}
        onChange={(value) => editItemHandler({ name: "minValue", value })}
        className={"justify-between"}
        value={limit.minValue}
      />
      <InputWithLabel
        label={"Макс."}
        name={"maxValue"}
        placeholder={"0"}
        onChange={(value) => editItemHandler({ name: "maxValue", value })}
        className={"justify-between"}
        value={limit.maxValue}
      />
      <UnitSelector
        unit={limit.unit}
        setUnit={(value) => editItemHandler({ name: "unit", value })}
      />
      <div className={"block ml-[10px]"}>
          <button type={'button'} className="w-7 h-7 flex text-red-600 cursor-pointer" onClick={deleteItemHandler}>
            <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" />
          </button>
      </div>
    </div>
  );
};
