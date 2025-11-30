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
    <div className={"flex items-center"}>
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
      />
      <div className={"block ml-[10px]"}>
        <TrashIcon
          className="w-5 h-5 text-red-500 cursor-pointer"
          onClick={deleteItemHandler}
        />
      </div>
    </div>
  );
};
