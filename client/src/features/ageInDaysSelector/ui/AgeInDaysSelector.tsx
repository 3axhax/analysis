import { SelectUI, SelectUIOption } from "@shared/ui";
import { useState } from "react";

interface AgeSelectorProps {
  ageInDays: number;
  setAgeInDays: (value: number) => void;
}

export const AgeInDaysSelector = ({
  ageInDays,
  setAgeInDays,
}: AgeSelectorProps) => {
  const [ageInMonth, setAgeInMonth] = useState<number>(ageInDays);
  const [ageInYear, setAgeInYear] = useState<number>(ageInDays);

  const ageInMonthOptions: SelectUIOption<number>[] = [
    { label: "< 1", value: 1 },
    ...Array.from({ length: 11 }, (_, i) => ({
      label: `${i + 1}`,
      value: (i + 1) * 30,
    })),
  ];

  const ageInYearOptions: SelectUIOption<number>[] = Array.from(
    { length: 100 },
    (_, i) => ({
      label: `${i + 1}`,
      value: (i + 1) * 360,
    }),
  );

  const selectMonthHendler = (value: number) => {
    setAgeInMonth(value);
    setAgeInYear(0);
    setAgeInDays(value);
  };

  const selectYearHendler = (value: number) => {
    setAgeInMonth(0);
    setAgeInYear(value);
    setAgeInDays(value);
  };

  return (
    <div>
      <SelectUI<number>
        label={"Возраст в месяцах"}
        name={"ageInMonth"}
        options={ageInMonthOptions}
        value={ageInMonth}
        onChange={selectMonthHendler}
        placeholder="Выберите возраст в месяцах"
        className="flex-grow"
      />
      <SelectUI<number>
        label={"Возраст в годах"}
        name={"ageInYear"}
        options={ageInYearOptions}
        value={ageInYear}
        onChange={selectYearHendler}
        placeholder="Выберите возраст в годах"
        className="flex-grow"
      />
    </div>
  );
};
