import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { selectAnalysisPointById } from "@entities/analysisPoint";
import { unitLabel } from "@entities/units";
import { TrashIcon } from "@heroicons/react/16/solid";
import { SelectUI } from "@shared/ui";
import { ChangeEvent, useEffect, useState } from "react";
import {
  addPointData,
  removePointData,
  removeSelectedPoint,
  SelectAnalysisResultPrepareDataPointDataByName,
} from "@entities/analysisResult";

interface AnalysisPointSelectedItemProps {
  pointId: number;
}

export const AnalysisPointSelectedItem = ({
  pointId,
}: AnalysisPointSelectedItemProps) => {
  const dispatch = useAppDispatch();

  const analysisPoint = useAppSelector((state) =>
    selectAnalysisPointById(state, pointId),
  );
  const pointData = useAppSelector((state) =>
    SelectAnalysisResultPrepareDataPointDataByName(
      state,
      analysisPoint?.name ?? "",
    ),
  );

  const [units, setUnits] = useState<string>("");
  const [pointValue, setPointValue] = useState<string>("");

  useEffect(() => {
    if (
      pointData &&
      parseFloat(pointValue) !== parseFloat(pointData.value.toString())
    ) {
      setPointValue(pointData.value.toString());
    }
  }, [pointData, pointValue]);

  useEffect(() => {
    if (pointData) setUnits(pointData.units);
  }, [pointData]);

  const handlerClear = () => {
    dispatch(removeSelectedPoint(pointId));
    if (analysisPoint) {
      dispatch(removePointData(analysisPoint.name));
    }
  };

  const handlerOnInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = parseFloat(e.target.value.replace(",", "."));
    setPointValue(
      !isNaN(value)
        ? e.target.value.replace(",", ".").replace(/[^\d.]/g, "")
        : "",
    );
    if (analysisPoint) {
      if (e.target.value.trim() === "") {
        dispatch(removePointData(analysisPoint.name));
        return;
      }
      dispatch(
        addPointData({
          name: analysisPoint.name,
          value: !isNaN(value) ? value : 0,
          units,
        }),
      );
    }
  };
  const handlerOnUnitsSelect = (value: string) => {
    setUnits(value);
    if (
      analysisPoint &&
      pointValue !== "" &&
      Number.isFinite(parseFloat(pointValue))
    ) {
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
          <div
            className={
              "flex flex-col lg:flex-row lg:items-center justify-stretch py-2 relative"
            }
          >
            <div className="flex min-w-0 items-center pr-10 lg:flex-1 lg:pr-0">
              <label
                htmlFor={analysisPoint.translationRu.trim().replace(/\s/g, "")}
                className="block break-words"
              >
                {analysisPoint.translationRu}{" "}
              </label>
            </div>

            <input
              id={analysisPoint.translationRu.trim().replace(/\s/g, "")}
              className={
                "min-w-0 px-4 py-2 lg:ml-4 lg:w-36 lg:shrink-0 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-800 focus:border-green-800 hover:border-green-800 hover:shadow-green-800"
              }
              value={pointValue}
              onInput={handlerOnInput}
            />

            {analysisPoint.units.length > 1 ? (
              <SelectUI<string>
                name={"unitSelect"}
                onChange={handlerOnUnitsSelect}
                placeholder={"ед. изм."}
                className="mt-4 min-w-0 lg:mt-0 lg:ml-3 lg:w-40 lg:shrink-0"
                options={analysisPoint.units.map((unit) => ({
                  label: unitLabel(
                    unit,
                    unit === pointData?.units
                      ? pointData.sourceUnitText
                      : undefined,
                  ),
                  value: unit,
                }))}
                value={units}
              />
            ) : analysisPoint.units.length === 1 ? (
              <div className="mt-2 min-w-0 break-words lg:mt-0 lg:ml-3 lg:w-40 lg:shrink-0">
                {units === analysisPoint.units[0] ? (
                  <span>{unitLabel(units, pointData?.sourceUnitText)}</span>
                ) : (
                  <div>
                    <span className="text-gray-500">
                      Единица не определена.{" "}
                    </span>
                    <button
                      type="button"
                      className="text-green-800 underline"
                      onClick={() =>
                        handlerOnUnitsSelect(analysisPoint.units[0])
                      }
                    >
                      Выбрать {unitLabel(analysisPoint.units[0])}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
            <button
              className={
                "w-10 h-10 shrink-0 absolute lg:relative -right-2.5 top-0 flex ml-auto items-center justify-center cursor-pointer text-red-600 dark:text-red-500 transition-colors hover:text-red-700"
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
