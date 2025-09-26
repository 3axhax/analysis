import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  removeSelectedPoint,
  selectAnalysisPointById,
} from "@entities/analysisPoint";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { TrashIcon } from "@heroicons/react/16/solid";
import SelectUI from "@shared/ui/SelectUI.tsx";
import { useEffect, useState } from "react";

interface AnalysisPointSelectedItemProps {
  pointId: number;
}

export const AnalysisPointSelectedItem = ({
  pointId,
}: AnalysisPointSelectedItemProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const analysisPoint = useAppSelector((state) =>
    selectAnalysisPointById(state, pointId),
  );

  const [units, setUnits] = useState<string>("");

  const handlerClear = () => {
    dispatch(removeSelectedPoint(pointId));
  };

  useEffect(() => {
    if (analysisPoint && analysisPoint.units.length > 0) {
      setUnits(analysisPoint.units[0]);
    }
  }, [analysisPoint]);

  return (
    <>
      {analysisPoint ? (
        <>
          <Tooltip
            anchorSelect=".description_anchor"
            place="top"
            className="max-w-xs !break-words !whitespace-normal !text-left"
          />
          <div className={"flex items-center"}>
            <label>
              {t(`analysisPoint.${analysisPoint.name}`)}{" "}
              <span
                className={"cursor-pointer description_anchor"}
                data-tooltip-content={t(
                  `analysisPoint.${analysisPoint.name}_description`,
                )}
              >
                ?
              </span>
              :
              <input
                className={
                  "px-4 py-2 ml-[10px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }
              />
            </label>
            {analysisPoint.units.length == 1 ? (
              <span className={"ml-[10px]"}>
                {t(`units.${analysisPoint.units[0]}`)}
              </span>
            ) : analysisPoint.units.length > 1 ? (
              /*<select className={"ml-[10px]"}>
                {analysisPoint.units.map((unit) => (
                  <option>{unit}</option>
                ))}
              </select>*/
              <SelectUI<string>
                name={"unitSelect"}
                onChange={setUnits}
                placeholder={"ед. изм."}
                options={analysisPoint.units.map((unit) => ({
                  label: t(`units.${unit}`),
                  value: unit,
                }))}
                value={units}
              />
            ) : null}
            <TrashIcon
              className="w-5 h-5 text-red-500 cursor-pointer ml-[10px]"
              onClick={handlerClear}
            />
          </div>
        </>
      ) : null}
    </>
  );
};
