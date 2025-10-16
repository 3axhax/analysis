import { useTranslation } from "react-i18next";
import { ResultDescription } from "@entities/analysisResult";

export const AnalysisDescriptionListItem = ({
  description,
}: {
  description: ResultDescription;
}) => {
  const { t } = useTranslation("common");
  const { t: tEntities } = useTranslation("entities");

  return (
    <tr className="border-t border-gray-300 hover:bg-gray-50">
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900">
        {description.description_ru}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <ul>
          {description.analysisResultDescriptionConditions.map((condition) => (
            <li key={condition.id}>
              {tEntities(`analysisPoint.${condition.analysisPoint.name}`)} -{" "}
              {t(`analysisDescriptionConditionStatus.${condition.status}`)}
            </li>
          ))}
        </ul>
      </td>
    </tr>
  );
};
