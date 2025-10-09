import { useTranslation } from "react-i18next";
import { PointData } from "@entities/analysisResult";

export const AnalysisPointDataListItem = ({
  pointData,
}: {
  pointData: PointData;
}) => {
  const { t } = useTranslation();
  const { t: tEntities } = useTranslation("entities");

  return (
    <tr className="border-t border-gray-300 hover:bg-gray-50">
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-900">
        {tEntities(`analysisPoint.${pointData.point.name}`)}
      </td>
      <td className="border-r border-gray-300 px-4 py-3 text-sm text-gray-600">
        {pointData.minValue} - {pointData.maxValue}{" "}
        {tEntities(`units.${pointData.pointUnit.name}`)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {pointData.value} {tEntities(`units.${pointData.pointUnit.name}`)}{" "}
        {t(`analysisDescriptionConditionStatus.${pointData.pointDataStatus}`)}
      </td>
    </tr>
  );
};
