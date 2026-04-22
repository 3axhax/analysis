import { SelectUI, SelectUIOption } from "@shared/ui";
import { useState } from "react";
import { Baby } from "@shared/ui/Icons/Baby.tsx";
import { Quest } from "@shared/ui/Icons/Quest.tsx";

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
    <div className={"flex flex-col"}>
      <span
        className={"text-lg font-medium text-gray-700 mb-1 dark:text-gray-100 "}
      >
        Введите возраст
      </span>
      <div className={"flex flex-col gap-2 lg:flex-row lg:gap-4"}>
        <SelectUI<number>
          label={
            <>
              В месяцах для детей до 1 года{" "}
              <Baby className={"size-5 -mt-1 ml-1 inline-flex"} />
            </>
          }
          name={"ageInMonth"}
          options={ageInMonthOptions}
          value={ageInMonth}
          onChange={selectMonthHendler}
          placeholder="Выберите возраст в месяцах"
          className="flex-grow"
        />
        <SelectUI<number>
          label={
            <>
              В годах для детей старше 1 года и взрослых{" "}
              <Quest className={"size-4 -mt-1 ml-1 inline-flex"} />
            </>
          }
          name={"ageInYear"}
          options={ageInYearOptions}
          value={ageInYear}
          onChange={selectYearHendler}
          placeholder="Выберите возраст в годах"
          className="flex-grow"
        />
      </div>
    </div>
  );
};
