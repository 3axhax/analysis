import React, { useEffect } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle.tsx";
import { GenderSelector } from "@features/genderSelector";
import { AgeSelector } from "@features/ageSelector";
import { AnalysisPointList } from "@features/analysisPointList";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  clearRedirect,
  resetPrepareData,
  sendAnalysisData,
} from "@entities/analysisResult";
import {
  SelectAnalysisResultPending,
  SelectAnalysisResultRedirectTo,
} from "@entities/analysisResult/model/slice.ts";
import { useNavigate } from "react-router-dom";

export const AnalysisPage = () => {
  useDocumentTitle("Загрузить анализы");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const pending = useAppSelector(SelectAnalysisResultPending);
  const redirectTo = useAppSelector(SelectAnalysisResultRedirectTo);

  useEffect(() => {
    dispatch(resetPrepareData());
  }, [dispatch]);

  useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo);
      dispatch(clearRedirect());
    }
  }, [dispatch, navigate, redirectTo]);

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(sendAnalysisData());
  };

  return (
    <div className="app w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Загрузите свои данные!
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
            <GenderSelector />
            <AgeSelector />
            <hr />
            <AnalysisPointList />

            <button
              type={"submit"}
              className={
                "bg-blue-600 text-white rounded-lg px-4 py-2 cursor-pointer hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
              }
              disabled={pending}
            >
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
