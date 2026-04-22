import { useEffect, useState } from "react";
import Select, { GroupBase, MultiValue } from "react-select";
import { selectAnalysisTypeListForMultiSelect } from "@entities/analysisType";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { SelectMultiUIOption, SelectUIOption } from "@shared/ui/SelectUI.tsx";
import {
  SelectAnalysisResultSelectedList,
  setSelectedPoint,
} from "@entities/analysisResult";

export const AnalysisPointGroupSelect = () => {
  const dispatch = useAppDispatch();

  const { t } = useTranslation("entities");

  const selectedPointsList = useAppSelector(SelectAnalysisResultSelectedList);

  const groupedOptions: SelectMultiUIOption<number>[] = useAppSelector(
    selectAnalysisTypeListForMultiSelect,
  ).map((group) => ({
    label: t(`analysisType.${group.label}`),
    options: group.options.map((option) => ({
      ...option,
      label: t(`analysisPoint.${option.label}`),
      group: t(`analysisType.${group.label}`),
    })),
  }));

  const [selectedOptions, setSelectedOptions] = useState<
    SelectUIOption<number>[]
  >([]);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    dispatch(setSelectedPoint(selectedOptions.map((point) => point.value)));
  }, [selectedOptions, dispatch]);

  useEffect(() => {
    if (selectedPointsList.length !== selectedOptions.length) {
      setSelectedOptions(
        groupedOptions.reduce<SelectUIOption<number>[]>((acc, group) => {
          return [
            ...acc,
            ...group.options.filter((option) =>
              selectedPointsList.includes(option.value),
            ),
          ];
        }, []),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPointsList]);

  // Обработчик изменения выбора
  const handleChange = (selected: MultiValue<SelectUIOption<number>>) => {
    const selectedList = selected ? [...selected] : [];
    setSelectedOptions(selectedList);
  };

  const groupClick = (label: string | undefined) => {
    const selectedOptionsValue = selectedOptions.map((option) => option.value);
    const addingGroup = groupedOptions.find((group) => group.label === label);
    if (addingGroup) {
      setSelectedOptions([
        ...selectedOptions,
        ...addingGroup.options.filter(
          (option) => !selectedOptionsValue.includes(option.value),
        ),
      ]);
    }
  };

  const formatGroupLabel = (data: GroupBase<SelectUIOption<number>>) => {
    const groupValues = data.options.map((opt) => opt.value);
    const selectedCount = selectedOptions.filter((opt) =>
      groupValues.includes(opt.value),
    ).length;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => groupClick(data.label)}
      >
        <span>{data.label}</span>
        <span style={{ fontSize: "12px", color: "#666" }}>
          ({selectedCount}/{data.options.length})
        </span>
      </div>
    );
  };

  return (
    <div style={{ width: "500px", margin: "50px auto" }}>
      <label htmlFor={"analysisPoints"}>Параметры анализов:</label>
      <div style={{ position: "relative" }}>
        <Select<SelectUIOption<number>, true>
          name={"analysisPoints"}
          isMulti
          options={groupedOptions}
          value={selectedOptions}
          onChange={handleChange}
          components={{
            MultiValue: () => null,
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
          }}
          formatGroupLabel={formatGroupLabel}
          placeholder=""
          closeMenuOnSelect={false}
          menuIsOpen={isMenuOpen}
          onMenuClose={() => setIsMenuOpen(false)}
          onMenuOpen={() => setIsMenuOpen(true)}
          className="basic-multi-select"
          classNamePrefix="select"
          styles={{
            control: (base) => ({
              ...base,
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              minHeight: "auto",
              "&:hover": {
                borderColor: "#999",
              },
            }),
            valueContainer: (base) => ({
              ...base,
              padding: "8px 12px",
              cursor: "pointer",
            }),
            input: (base) => ({
              ...base,
              margin: 0,
              padding: 0,
            }),
            menu: (base) => ({
              ...base,
              position: "absolute",
              zIndex: 999,
            }),
          }}
        />

        {/* Кастомный индикатор выбранных элементов */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "20px",
            bottom: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            pointerEvents: "none",
            backgroundColor: "transparent",
          }}
        >
          {selectedOptions.length === 0 ? null : (
            <span
              style={{
                backgroundColor: "#e8f0fe",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Выбрано: {selectedOptions.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
