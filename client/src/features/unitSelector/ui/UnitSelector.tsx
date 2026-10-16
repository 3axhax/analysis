import { SelectUI } from "@shared/ui";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useUnitsLoad, unitLabel } from "@entities/units";
import { selectUnitsListForSelect } from "@entities/units";

interface AgeSelectorProps {
  unit: string;
  setUnit: (value: string) => void;
}

export const UnitSelector = ({ unit, setUnit }: AgeSelectorProps) => {
  const unitsOptions = useAppSelector(selectUnitsListForSelect);
  useUnitsLoad();

  return (
    <SelectUI<string>
      label={"Единицы изм."}
      name={"units"}
      options={unitsOptions.map((item) => ({
        ...item,
        label: unitLabel(item.label),
      }))}
      value={unit}
      onChange={setUnit}
      placeholder="Единица измерений"
      className="w-[220px]"
    />
  );
};
