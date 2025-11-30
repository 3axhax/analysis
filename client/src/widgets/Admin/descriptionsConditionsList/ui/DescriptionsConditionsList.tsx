import { useAppSelector } from "@shared/store/hooks.ts";
import { selectConditionsDescriptionById } from "@entities/descriptions";
import { useTranslation } from "react-i18next";

export const DescriptionsConditionsList = ({
  descriptionId,
}: {
  descriptionId: number;
}) => {
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");

  const conditions = useAppSelector((state) =>
    selectConditionsDescriptionById(state, descriptionId),
  );
  return (
    <>
      {conditions.length > 0 ? (
        <ul>
          {conditions.map((condition) => (
            <li key={condition.id}>
              {tEntities(`analysisPoint.${condition.analysisPoint.name}`)} -{" "}
              {t(`analysisDescriptionConditionStatus.${condition.status}`)}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
};
