import RadioGroup from "@shared/ui/RadioGroup.tsx";
import { GenderType, useGenderLoad } from "@entities/gender";
import { selectGenderListForSelect } from "@entities/gender";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";

interface GenderSelectorProps {
  value: GenderType;
  onChange: (value: GenderType) => void;
}

export const GenderSelector = ({ value, onChange }: GenderSelectorProps) => {
  useGenderLoad();
  const { t } = useTranslation();

  const genderOptions = useAppSelector(selectGenderListForSelect);

  return (
    <RadioGroup<GenderType>
      label="Пол"
      name="gender"
      options={genderOptions.map((item) => ({
        ...item,
        label: t(`gender.${item.label}`),
      }))}
      value={value}
      onChange={(value) => onChange(value)}
    />
  );
};
