import SelectUI from "@shared/ui/SelectUI.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAgesListForSelect, useAgesLoad } from "@entities/ages";
import { useTranslation } from "react-i18next";

interface AgeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const AgeSelector = ({ value, onChange }: AgeSelectorProps) => {
  const ageOptions = useAppSelector(selectAgesListForSelect);
  useAgesLoad();
  const { t } = useTranslation();
  return (
    <SelectUI<string>
      label="Возрастная группа"
      name={"age"}
      options={ageOptions.map((item) => ({
        ...item,
        label: t(`ages.${item.label}`),
      }))}
      value={value}
      onChange={onChange}
      placeholder="Выберите возраст"
      className="max-w-xs"
    />
  );
};
