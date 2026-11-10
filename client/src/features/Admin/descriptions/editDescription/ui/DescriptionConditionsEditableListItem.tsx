import { TrashIcon } from "@heroicons/react/16/solid";
import { DescriptionCondition } from "@entities/descriptions";
import { AnalysisPointsSelector } from "@features/analysisPointsSelector";
import { RadioGroup, SelectUI, type SelectUIOption } from "@shared/ui";
import { useTranslation } from "react-i18next";

export type SourceConditionMode = "own" | "inherited" | "both" | "unknown";

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
  source?: {
    mode: SourceConditionMode;
    options: SelectUIOption<number>[];
    onModeChange: (mode: SourceConditionMode) => void;
  };
}

export const DescriptionConditionsEditableListItem = ({
  serialNumber,
  condition,
  deleteItemHandler,
  editItemHandler,
  source,
}: DescriptionConditionsEditableListItemProps) => {
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");
  const setPoint = (value: number) =>
    editItemHandler({ name: "analysisPoint", value: { id: value, name: "" } });
  const conditionStatusOptions = [
    { value: "0", label: t("analysisDescriptionConditionStatus.0") },
    { value: "1", label: t("analysisDescriptionConditionStatus.1") },
    { value: "-1", label: t("analysisDescriptionConditionStatus.-1") },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 line-between pb-4">
      <div className="flex-1 min-w-[270px] space-y-2">
        {source && (
          <>
            <RadioGroup<SourceConditionMode>
              label="Тип параметра"
              name={`condition-mode-${serialNumber}`}
              options={[
                { value: "own", label: "Из источника" },
                { value: "inherited", label: "Наследованный" },
              ]}
              value={source.mode}
              onChange={source.onModeChange}
              labelClassName="text-sm font-medium"
            />
            {source.mode === "both" && (
              <p>Есть собственный норматив и наследование</p>
            )}
            {source.mode === "unknown" && <p>Норматив не найден</p>}
          </>
        )}
        {source ? (
          <SelectUI<number>
            label="Параметр"
            name={`source-point-${serialNumber}`}
            options={source.options}
            value={condition.analysisPoint.id}
            onChange={setPoint}
            placeholder="Выберите"
          />
        ) : (
          <AnalysisPointsSelector
            analysisPoint={condition.analysisPoint.id}
            setAnalysisPoint={setPoint}
            label="Параметр"
          />
        )}
      </div>
      <RadioGroup<string>
        label={tEntities("descriptions.conditionStatus")}
        name={`status_${serialNumber}`}
        options={conditionStatusOptions}
        value={condition.status}
        onChange={(value) => editItemHandler({ name: "status", value })}
        labelClassName="text-sm font-medium text-gray-700 mb-2"
        className="flex-col items-center justify-between"
      />
      <button
        type="button"
        aria-label="Удалить условие"
        className="w-7 h-7 flex items-center text-red-600 cursor-pointer ml-[10px] hover:text-red-800 transition-colors"
        onClick={deleteItemHandler}
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
