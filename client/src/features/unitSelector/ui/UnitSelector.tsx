import SelectUI from "@shared/ui/SelectUI.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { useUnitsLoad } from "@entities/units";
import { selectUnitsListForSelect } from "@entities/units";

interface AgeSelectorProps {
  unit: string;
  setUnit: (value: string) => void;
}

export const UnitSelector = ({ unit, setUnit }: AgeSelectorProps) => {
  const unitsOptions = useAppSelector(selectUnitsListForSelect);
  useUnitsLoad();
  const { t: tEntities } = useTranslation("entities");

  return (
    <SelectUI<string>
      label={"Единицы изм."}
      name={"units"}
      options={unitsOptions.map((item) => ({
        ...item,
        label: tEntities(`units.${item.label}`),
      }))}
      value={unit}
      onChange={setUnit}
      placeholder="Выберите единицу измерений"
      className="w-full mb-4"
    />
  );
};
