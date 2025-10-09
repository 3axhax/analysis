import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectAnalysisResultDescriptionData } from "@entities/analysisResult";
import { useTranslation } from "react-i18next";
import { ResultDescription } from "@entities/analysisResult";
import { AnalysisDescriptionListItem } from "@widgets/analysisDescriptionList/ui/AnalysisDescriptionListItem.tsx";

export const AnalysisDescriptionList = ({
  resultId,
  className,
}: {
  resultId: string;
  className?: string;
}) => {
  const { t: tWidgets } = useTranslation("widgets");
  const descriptionList = useAppSelector((state) =>
    SelectAnalysisResultDescriptionData(state, resultId),
  );

  return (
    <table
      className={`min-w-full border border-gray-300${className ? " " + className : ""}`}
    >
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
        {descriptionList &&
          [...descriptionList]
            .sort(
              (a, b) =>
                b.analysisResultDescriptionConditions.length -
                a.analysisResultDescriptionConditions.length,
            )
            .map((description: ResultDescription) => (
              <AnalysisDescriptionListItem
                key={description.id}
                description={description}
              />
            ))}
      </tbody>
    </table>
  );
};
