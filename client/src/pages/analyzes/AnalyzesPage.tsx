import React, { useState } from "react";
import RadioGroup, { RadioOption } from "@shared/ui/RadioGroup.tsx";
import SelectUI from "@shared/ui/SelectUI.tsx";
import useDocumentTitle from "@entities/hooks/useDocumentTitle.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { selectAgesListForSelect, useAgesLoad } from "@entities/ages";

export type GenderType = "m" | "f";
export const AnalyzesPage = () => {
  useDocumentTitle("Загрузить анализы");
  useAgesLoad();

  const genderOptions: RadioOption<GenderType>[] = [
    { value: "m", label: "М" },
    { value: "f", label: "Ж" },
  ];

  const ageOptions = useAppSelector(selectAgesListForSelect);

  const [gender, setGender] = useState<GenderType>("m");
  const [age, setAge] = useState<string>("");

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
            />
            <SelectUI<string>
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
