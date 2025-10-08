import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectAnalysisResultDescriptionData } from "@entities/analysisResult";
import { useTranslation } from "react-i18next";
import { ResultDescription } from "@entities/analysisResult/model/types.ts";

export const AnalysisDescriptionList = ({ resultId }: { resultId: string }) => {
  const { t } = useTranslation();
  const { t: tWidgets } = useTranslation("widgets");
  const { t: tEntities } = useTranslation("entities");
  const descriptionList = useAppSelector((state) =>
    SelectAnalysisResultDescriptionData(state, resultId),
  );
  console.log(descriptionList);

  return (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {tWidgets("analysisDescriptionList.description")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {tWidgets("analysisDescriptionList.reasons")}
          </th>
        </tr>
      </thead>
      <tbody>
        {descriptionList.map((description: ResultDescription) => (
          <tr
            key={description.id}
            className="border-t border-gray-300 hover:bg-gray-50"
          >
            <td className="border-r border-gray-300 px-4 py-3 text-sm font-medium text-gray-900">
              {description.description_ru}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              <ul>
                {description.analysisResultDescriptionConditions.map(
                  (condition) => (
                    <li key={condition.id}>
                      {tEntities(
                        `analysisPoint.${condition.analysisPoint.name}`,
                      )}{" "}
                      -{" "}
                      {t(
                        `analysisDescriptionConditionStatus.${condition.status}`,
                      )}
                    </li>
                  ),
                )}
              </ul>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
