import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAnalysisPointLimits } from "@entities/analysisPoint";
import { useTranslation } from "react-i18next";

export const AnalysisPointDataLimits = ({
  analysisPointId,
}: {
  analysisPointId: number;
}) => {
  const { t } = useTranslation("entities");
  const limits = useAppSelector((state) =>
    selectAnalysisPointLimits(state, analysisPointId),
  );
  return limits ? (
    <table>
      <tbody>
        {limits.map((limit, i) => {
          if (limit.skipGender) return null;
          const interval =
            (limit.minValue === 0
              ? ` < ${limit.maxValue}`
              : limit.maxValue === 0
                ? ` > ${limit.minValue}`
                : `${limit.minValue} - ${limit.maxValue}`) +
            ` ${t(`units.${limit.unit}`)}`;

          return (
            <tr
              key={i}
              className={
                i < limits.length - 1 ? "border-b border-gray-300" : ""
              }
            >
              {limit.skipAge ? (
                <td className={"p-2"} rowSpan={2}>
                  {t(`ages.${limit.age}`)}
                </td>
              ) : limits[i - 1] &&
                limits[i - 1].skipAge &&
                !limits[i - 1].skipGender ? null : (
                <td className={"p-2"}>{t(`ages.${limit.age}`)}</td>
              )}
              <td className={"p-2"}>
                {limits[i - 1] && limits[i - 1].skipGender
                  ? ""
                  : t(`gender.${limit.gender}`)}
              </td>
              <td className={"p-2"}>{interval}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : null;
};
