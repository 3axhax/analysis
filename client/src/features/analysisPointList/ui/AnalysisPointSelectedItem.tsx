import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  removeSelectedPoint,
  selectAnalysisPointById,
} from "@entities/analysisPoint";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import { TrashIcon } from "@heroicons/react/16/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
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
          <div className={"flex items-center justify-stretch group"}>
            <div className={"flex items-center lg:w-[180px]"}>
              <label
                htmlFor={t(`analysisPoint.${analysisPoint.name}`)
                  .trim()
                  .replace(/\s/g, "")}
                className={"block lg:max-w-[160px] truncate"}
              >
                {t(`analysisPoint.${analysisPoint.name}`)}{" "}
              </label>
              <button
                className={
                  "cursor-pointer description_anchor w-5 h-7 inline-flex text-gray-500 items-start justify-center hover:text-green-800"
                }
                data-tooltip-content={t(
                  `analysisPoint.${analysisPoint.name}_description`,
                )}
              >
                <span className={"sr-only"}>Информация о показателе</span>
                <InformationCircleIcon className="inline-flex h-4 w-4 transition-transform hover:scale-110" />
              </button>
            </div>

            <input
              id={t(`analysisPoint.${analysisPoint.name}`)
                .trim()
                .replace(/\s/g, "")}
              className={
                "px-4 py-2 ml-[10px] border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-800 focus:border-green-800 hover:border-green-800 hover:shadow-green-800"
              }
              value={pointValue}
              onInput={handlerOnInput}
            />

            {analysisPoint.units.length == 1 ? (
              <span className={"ml-[10px] text-right"}>
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
            <button
              className={
                "w-10 h-10 flex ml-auto items-center justify-center cursor-pointer text-red-600 transition-colors hover:text-red-700"
              }
              onClick={handlerClear}
            >
              <span className={"sr-only"}>Delete</span>
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : null}
    </>
  );
};
