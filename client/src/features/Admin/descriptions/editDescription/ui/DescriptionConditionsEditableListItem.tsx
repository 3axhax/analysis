import { TrashIcon } from "@heroicons/react/16/solid";
import { DescriptionCondition } from "@entities/descriptions";
import { AnalysisPointsSelector } from "@features/analysisPointsSelector";
import RadioGroup from "@shared/ui/RadioGroup.tsx";
import { useTranslation } from "react-i18next";

interface DescriptionConditionsEditableListItemProps {
  serialNumber: number;
  condition: DescriptionCondition;
  deleteItemHandler: () => void;
  editItemHandler: ({
    name,
    value,
  }: {
    name: keyof DescriptionCondition;
    value: string | number | { id: number; name: string };
  }) => void;
}

export const DescriptionConditionsEditableListItem = ({
  serialNumber,
  condition,
  deleteItemHandler,
  editItemHandler,
}: DescriptionConditionsEditableListItemProps) => {
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");

  const conditionStatusOptions = [
    { value: "0", label: t(`analysisDescriptionConditionStatus.0`) },
    { value: "1", label: t(`analysisDescriptionConditionStatus.1`) },
  ];

  console.log(condition);

  return (
    <div className={"flex items-center justify-between mb-5 line-between"}>
      <AnalysisPointsSelector
        analysisPoint={condition.analysisPoint.id}
        setAnalysisPoint={(value) =>
          editItemHandler({
            name: "analysisPoint",
            value: { id: value, name: "" },
          })
        }
      />
      <RadioGroup<string>
        label={tEntities("descriptions.conditionStatus")}
        name={`status_${serialNumber}`}
        options={conditionStatusOptions}
        value={condition.status}
        onChange={(value) => editItemHandler({ name: "status", value })}
        labelClassName={'text-sm font-medium text-gray-700 mb-2'}
        className={'flex-col items-center justify-between'}
      />
        <button type={'button'} className="w-7 h-7 flex items-center text-red-600 cursor-pointer ml-[10px] hover:text-red-800 transition-colors" onClick={deleteItemHandler}>
            <TrashIcon
                className="w-5 h-5 cursor-pointer"
                onClick={deleteItemHandler}
            />
        </button>
    </div>
);
};
