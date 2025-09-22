import React, { useState } from "react";
import RadioGroup, { RadioOption } from "@entities/ui/RadioGroup.tsx";
import SelectUI, { SelectUIOption } from "@entities/ui/SelectUI.tsx";
import useDocumentTitle from "@entities/hooks/useDocumentTitle.tsx";

export type GenderType = "m" | "f";
export const AnalyzesPage = () => {
  useDocumentTitle("Загрузить анализы");
  const genderOptions: RadioOption<GenderType>[] = [
    { value: "m", label: "М" },
    { value: "f", label: "Ж" },
  ];
  const ageOptions: SelectUIOption<number>[] = [
    { value: 1, label: "0-1 мес." },
    { value: 2, label: "1-3 мес." },
    { value: 3, label: "3-6 мес." },
    { value: 4, label: "1-3 года" },
    { value: 5, label: "3-6 лет" },
    { value: 6, label: "6-9 лет" },
    { value: 7, label: "9-15 лет" },
    { value: 8, label: "15-18 лет" },
    { value: 9, label: "старше 18 лет" },
  ];

  const [gender, setGender] = useState<GenderType>("m");
  const [age, setAge] = useState<number>(0);

  const handlerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ gender, age });
  };

  return (
    <div className="app">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Загрузите свои данные
        </h1>
      </div>

      <div className="mx-auto text-left">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Сведения по пациенте
          </h2>
          <form
            className="space-y-2 text-gray-600 dark:text-gray-300"
            onSubmit={handlerSubmit}
          >
            <RadioGroup<GenderType>
              label="Пол"
              name="gender"
              options={genderOptions}
              value={gender}
              onChange={(value) => setGender(value)}
              orientation="vertical"
            />
            <SelectUI<number>
              label="Возрастная группа"
              name={"age"}
              options={ageOptions}
              value={age}
              onChange={(value) => setAge(value)}
              placeholder="Выберите возраст"
              className="max-w-xs"
            />
            <button
              type={"submit"}
              className={
                "bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-400"
              }
            >
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
