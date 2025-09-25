import React, { useState } from "react";
import SelectUI from "@shared/ui/SelectUI.tsx";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { useAppSelector } from "@shared/store/hooks.ts";
import { useTranslation } from "react-i18next";
import { GenderSelector } from "@features/genderSelector";
import { AgeSelector } from "@features/ageSelector";
import { useAnalysisTypeLoad } from "@entities/analysisType/analysisType.hooks.ts";
import { selectAnalysisTypeListForSelect } from "@entities/analysisType/model/slice.ts";

export type GenderType = "m" | "f";
export const AnalysisPage = () => {
  useDocumentTitle("Загрузить анализы");

  useAnalysisTypeLoad();

  const { t } = useTranslation();
  const analysisTypeOptions = useAppSelector(selectAnalysisTypeListForSelect);

  const [gender, setGender] = useState<GenderType>("m");
  const [age, setAge] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<number>(0);

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
            <GenderSelector value={gender} onChange={setGender} />
            <AgeSelector value={age} onChange={setAge} />

            <SelectUI<number>
              label="Тип анализов"
              name={"age"}
              options={analysisTypeOptions.map((item) => ({
                ...item,
                label: t(`analysisType.${item.label}`),
              }))}
              value={analysisType}
              onChange={(value) => setAnalysisType(value)}
              placeholder="Выберите тип анализов"
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
