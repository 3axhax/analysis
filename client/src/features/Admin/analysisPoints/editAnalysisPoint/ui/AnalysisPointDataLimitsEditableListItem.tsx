import { AnalysisPointLimit } from "@entities/analysisPoint";
import { InputWithLabel } from "@shared/ui";
import { UnitSelector } from "@features/unitSelector";
import { TrashIcon } from "@heroicons/react/16/solid";
import { GenderType } from "@shared/lib/types";
import React from "react";
import { AgeMultiSelector } from "@features/ageMultiSelector";
import { GenderMultiSelector } from "@features/genderMultiSelector";
import { arrayCompare } from "@shared/utils";

interface AnalysisPointDataLimitsEditableListItemProps {
  limit: AnalysisPointLimit;
  totalLimits: number;
  deleteItemHandler: () => void;
  editItemHandler: ({
    name,
    value,
  }: {
    name: keyof AnalysisPointLimit;
    value: string | number | GenderType | string[] | GenderType[];
  }) => void;
}

export const AnalysisPointDataLimitsEditableListItem = React.memo(
  ({
    limit,
    deleteItemHandler,
    editItemHandler,
  }: AnalysisPointDataLimitsEditableListItemProps) => {
    return (
      <div className={"flex items-end justify-between line-between"}>
        <AgeMultiSelector
          age={limit.age}
          setAge={(value) => editItemHandler({ name: "age", value })}
        />
        <GenderMultiSelector
          gender={limit.gender}
          setGender={(value) => editItemHandler({ name: "gender", value })}
        />

        <InputWithLabel
          label={"Мин."}
          name={"minValue"}
          placeholder={"0"}
          onChange={(value) => editItemHandler({ name: "minValue", value })}
          className={"justify-between mr-2"}
          value={limit.minValue}
        />
        <InputWithLabel
          label={"Макс."}
          name={"maxValue"}
          placeholder={"0"}
          onChange={(value) => editItemHandler({ name: "maxValue", value })}
          className={"justify-between mr-2"}
          value={limit.maxValue}
        />
        <UnitSelector
          unit={limit.unit}
          setUnit={(value) => editItemHandler({ name: "unit", value })}
        />
        <button
          type={"button"}
          className="w-7 h-7 flex text-red-600 cursor-pointer hover:text-red-700 transition-colors"
          onClick={deleteItemHandler}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    const prevLimit = prevProps.limit;
    const nextLimit = nextProps.limit;
    return (
      prevProps.totalLimits === nextProps.totalLimits &&
      arrayCompare(prevLimit.age, nextLimit.age) &&
      arrayCompare(prevLimit.gender, nextLimit.gender) &&
      prevLimit.unit === nextLimit.unit &&
      prevLimit.minValue === nextLimit.minValue &&
      prevLimit.maxValue === nextLimit.maxValue
    );
  },
);
