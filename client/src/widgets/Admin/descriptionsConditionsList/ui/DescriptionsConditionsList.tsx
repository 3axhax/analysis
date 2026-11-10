import { useAppSelector } from "@shared/store/hooks.ts";
import { selectConditionsDescriptionById } from "@entities/descriptions";
import { useTranslation } from "react-i18next";

export const ConditionsList = ({
  conditions,
}: {
  conditions: { name: string; status: string }[];
}) => {
  const { t } = useTranslation("common");
  return conditions.length ? (
    <ul>
      {conditions.map((condition, index) => (
        <li key={index}>
          {condition.name} -{" "}
          {t(`analysisDescriptionConditionStatus.${condition.status}`)}
        </li>
      ))}
    </ul>
  ) : null;
};

export const DescriptionsConditionsList = ({
  descriptionId,
}: {
  descriptionId: number;
}) => {
  const { t } = useTranslation("entities");
  const conditions = useAppSelector((state) =>
    selectConditionsDescriptionById(state, descriptionId),
  );
  return (
    <ConditionsList
      conditions={conditions.map((condition) => ({
        name: t(`analysisPoint.${condition.analysisPoint.name}`),
        status: condition.status,
      }))}
    />
  );
};
