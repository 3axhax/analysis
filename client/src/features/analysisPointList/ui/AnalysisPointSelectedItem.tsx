import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  removeSelectedPoint,
  selectAnalysisPointById,
} from "@entities/analysisPoint";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { TrashIcon } from "@heroicons/react/16/solid";
import SelectUI from "@shared/ui/SelectUI.tsx";
import { ChangeEvent, useEffect, useState } from "react";
import { addPointData, removePointData } from "@entities/analysisResult";

interface AnalysisPointSelectedItemProps {
  pointId: number;
}

export const AnalysisPointSelectedItem = ({
  pointId,
}: AnalysisPointSelectedItemProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("entities");
  const analysisPoint = useAppSelector((state) =>
    selectAnalysisPointById(state, pointId),
  );

  const [units, setUnits] = useState<string>("");
  const [pointValue, setPointValue] = useState<string>("");

  const handlerClear = () => {
    dispatch(removeSelectedPoint(pointId));
    if (analysisPoint) {
      dispatch(removePointData(analysisPoint.name));
    }
  };

  useEffect(() => {
    if (analysisPoint && analysisPoint.units.length > 0) {
      setUnits(analysisPoint.units[0]);
    }
  }, [analysisPoint]);

  const handlerOnInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPointValue(e.target.value.replace(",", "."));
    if (analysisPoint) {
      dispatch(
        addPointData({
          name: analysisPoint.name,
          value: parseFloat(e.target.value.replace(",", ".")),
          units,
        }),
      );
    }
  };
  const handlerOnUnitsSelect = (value: string) => {
    setUnits(value);
    if (analysisPoint) {
      dispatch(
        addPointData({
          name: analysisPoint.name,
          value: parseFloat(pointValue),
          units: value,
        }),
      );
    }
  };

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
                value={pointValue}
                onInput={handlerOnInput}
              />
            </label>
            {analysisPoint.units.length == 1 ? (
              <span className={"ml-[10px]"}>
                {t(`units.${analysisPoint.units[0]}`)}
              </span>
            ) : analysisPoint.units.length > 1 ? (
              <SelectUI<string>
                name={"unitSelect"}
                onChange={handlerOnUnitsSelect}
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
