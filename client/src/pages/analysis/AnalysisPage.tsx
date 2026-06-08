import React, { useEffect, useState } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle";
import { GenderSelector } from "@features/genderSelector";
import { AnalysisPointList } from "@features/analysisPointList";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import {
  clearRedirect,
  resetPrepareData,
  resetSelectedPoints,
  SelectAnalysisResultPending,
  SelectAnalysisResultPrepareDataAgeInDays,
  SelectAnalysisResultPrepareDataGender,
  SelectAnalysisResultRedirectTo,
  sendAnalysisData,
  setPrepareDataAgeInDays,
  setPrepareDataGender,
} from "@entities/analysisResult";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GenderType } from "@shared/lib/types";
import { DropFile } from "@pages/analysis/Dropfile.tsx";
import { Donwload, ListsIcon} from "@shared/ui/Icons";
import { AgeInDaysSelector } from "@features/ageInDaysSelector";
import {ExistedAnalysisList} from "@widgets/existedAnalysisList";

export const AnalysisPage = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.analysis"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const pending = useAppSelector(SelectAnalysisResultPending);
  const redirectTo = useAppSelector(SelectAnalysisResultRedirectTo);
  const ageInDays = useAppSelector(SelectAnalysisResultPrepareDataAgeInDays);
  const gender = useAppSelector(SelectAnalysisResultPrepareDataGender);

  const [error, setError] = useState<string>("");

  useEffect(() => {
    dispatch(resetPrepareData());
    dispatch(resetSelectedPoints());
  }, [dispatch]);

  useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo);
      dispatch(clearRedirect());
    }
  }, [dispatch, navigate, redirectTo]);

  useEffect(() => {
    if (ageInDays || gender) {
      setError("");
    }
  }, [ageInDays, gender]);

  const handlerAgeSelect = (value: number) => {
    dispatch(setPrepareDataAgeInDays(value));
  };

  const handlerGenderSelect = (value: GenderType) => {
    dispatch(setPrepareDataGender(value));
  };

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ageInDays && gender) {
      dispatch(sendAnalysisData());
    } else {
      setError("Не заполнен пол или возраст");
    }
  };

  return (
    <div className="app w-full bg-white dark:bg-gray-900">
      <div className="mb-8 lg:w-4/12 sm:w-full" id={"preparation"}>
        <h2 className="text-2xl font-light lg:text-4xl font-sans text-gray-900 dark:text-white mb-4">
          <ListsIcon className={"inline size-6 lg:size-8 mr-2 mb-2"} />
          Список анализов
        </h2>
        {/*<ul className={"text-left mb-4"}>
          <li className={'mb-2'}>
                <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
                Общий анализ крови с лейкоцитарной формулой и СОЭ
          </li>
          <li className={'mb-2'}>
            <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
            Анемия или избыток железа
          </li>
          <li className={'mb-2'}>
          <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
            Оценка работы печени
          </li>
          <li className={'mb-2'}>
            <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
            Оценка работы почек
          </li>
          <li className={'mb-2'}>
            <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
            Углеводный обмен
          </li>
          <li className={'mb-2'}>
            <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
            Липидный обмен
          </li>
          <li className={'mb-2'}>
            <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
            Белковый обмен
          </li>
          <li className={'mb-2'}>
            <CheckCircleIcon className="inline h-5 w-5 text-cyan-600 mr-2 dark:text-white"/>
            Минеральный обмен
          </li>
        </ul>*/}
        <ExistedAnalysisList/>
      </div>
      <div className="mb-20 lg:w-8/12 sm:w-full" id={"analysis"}>
        <h2 className="text-2xl font-light lg:text-4xl font-sans text-gray-900 mb-2 dark:text-white">
          <Donwload className="inline size-6 lg:size-8 mr-2 mb-2" />
          {t("pageTitle.analysis")}
        </h2>
        <DropFile />
        <div className="mx-auto text-left relative overflow-hidden">
          <div className="b-border">
            <div className="trail"></div>
          </div>
          <div className="b-border__content p-4 lg:p-8">
            <h2 className="font-light text-2xl text-center text-gray-900 dark:text-white mb-4">
              Введите данные
            </h2>
            <form
              className="space-y-2 text-gray-600 dark:text-gray-300"
              onSubmit={handlerSubmit}
            >
              <div
                className={
                  "flex gap:2 flex-col lg:flex-row justify-between lg:gap-8"
                }
              >
                <GenderSelector
                  gender={gender}
                  setGender={handlerGenderSelect}
                />
                <AgeInDaysSelector
                  ageInDays={ageInDays}
                  setAgeInDays={handlerAgeSelect}
                />
              </div>
              {error !== "" ? (
                <div className={"bg-red-300 mb-2 p-2 rounded-lg text-center"}>
                  {error}
                </div>
              ) : null}
              <AnalysisPointList />

              <button
                type={"submit"}
                className={"btn w-full"}
                disabled={pending}
              >
                Расшифровать
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
