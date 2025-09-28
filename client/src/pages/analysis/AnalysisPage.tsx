import React, { useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { GenderSelector } from "@features/genderSelector";
import { AgeSelector } from "@features/ageSelector";
import { AnalysisPointList } from "@widgets/analysisPointList";
import Request from "@shared/transport/RestAPI.ts";
import { GenderType } from "@entities/gender";

export const AnalysisPage = () => {
  useDocumentTitle("Загрузить анализы");

  const [gender, setGender] = useState<GenderType>("m");
  const [age, setAge] = useState<string>("");

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ gender, age });
    const response = await Request.post("/result/save", { gender, age });
    console.log(response.data);
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
            <hr />
            <AnalysisPointList />

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
