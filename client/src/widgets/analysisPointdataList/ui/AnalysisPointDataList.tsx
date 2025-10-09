import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { SelectAnalysisResultPointData } from "@entities/analysisResult/model/slice.ts";
import { AnalysisPointDataListItem } from "@widgets/analysisPointdataList/ui/AnalysisPointDataListItem.tsx";

export const AnalysisPointDataList = ({
  resultId,
  className,
}: {
  resultId: string;
  className?: string;
}) => {
  const { t: tWidgets } = useTranslation("widgets");
  const pointDataList = useAppSelector((state) =>
    SelectAnalysisResultPointData(state, resultId),
  );

  return (
    <table
      className={`min-w-full border border-gray-300${className ? " " + className : ""}`}
    >
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {tWidgets("analysisPointDataList.name")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {tWidgets("analysisPointDataList.interval")}
          </th>
          <th className="border-r border-gray-600 px-4 py-3 text-center text-sm font-medium">
            {tWidgets("analysisPointDataList.value")}
          </th>
        </tr>
      </thead>
      <tbody>
        {pointDataList &&
          pointDataList.map((pointData) => (
            <AnalysisPointDataListItem
              pointData={pointData}
              key={pointData.id}
            />
          ))}
      </tbody>
    </table>
  );
};
