import { useTranslation } from "react-i18next";
import { DescriptionCondition } from "@entities/descriptions";
import { DescriptionConditionsEditableListItem } from "@features/Admin/descriptions/editDescription/ui/DescriptionConditionsEditableListItem.tsx";
import {PlusCircleIcon} from "@heroicons/react/16/solid";

interface AnalysisPointDataLimitsEditableListProps {
  onChange: (value: DescriptionCondition[]) => void;
  conditions: DescriptionCondition[];
}

export const DescriptionConditionsEditableList = ({
  onChange,
  conditions,
}: AnalysisPointDataLimitsEditableListProps) => {
  const { t } = useTranslation("entities");

  const addConditionHandler = () => {
    onChange([
      ...conditions,
      {
        analysisPoint: { id: 0, name: "" },
        status: "",
      },
    ]);
  };

  const deleteItemHandler = (i: number) => {
    onChange(conditions.filter((_, index) => index !== i));
  };

  const editItemHandler = ({
    i,
    name,
    value,
  }: {
    i: number;
    name: keyof DescriptionCondition;
    value: number | string | { id: number; name: string };
  }) => {
    onChange(
      conditions.map((condition, index) => {
        if (index === i) {
          return {
            ...condition,
            [name]: value,
          };
        }
        return condition;
      }),
    );
  };

  return (
    <>
      {conditions.length > 0 &&
        conditions.map((condition, i) => (
          <DescriptionConditionsEditableListItem
            key={i}
            serialNumber={i}
            condition={condition}
            deleteItemHandler={() => deleteItemHandler(i)}
            editItemHandler={({ name, value }) =>
              editItemHandler({ i, name, value })
            }
          />
        ))}
      <button className={"btn py-2 px-3"} onClick={addConditionHandler}>
        <PlusCircleIcon className="h-5 w-5 text-white inline-flex mr-2" />
        {t("descriptions.addNewCondition")}
      </button>
    </>
  );
};
