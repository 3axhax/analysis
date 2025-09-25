import RadioGroup, { RadioOption } from "@shared/ui/RadioGroup.tsx";
import { GenderType } from "@pages/analysis/AnalysisPage.tsx";

interface GenderSelectorProps {
  value: GenderType;
  onChange: (value: GenderType) => void;
}

export const GenderSelector = ({ value, onChange }: GenderSelectorProps) => {
  const genderOptions: RadioOption<GenderType>[] = [
    { value: "m", label: "М" },
    { value: "f", label: "Ж" },
  ];

  return (
    <RadioGroup<GenderType>
      label="Пол"
      name="gender"
      options={genderOptions}
      value={value}
      onChange={(value) => onChange(value)}
    />
  );
};
