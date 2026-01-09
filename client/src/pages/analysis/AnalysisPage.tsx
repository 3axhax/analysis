import React, { useEffect } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle";
import { GenderSelector } from "@features/genderSelector";
import { AgeSelector } from "@features/ageSelector";
import { AnalysisPointList } from "@features/analysisPointList";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import {
  clearRedirect,
  resetPrepareData,
  resetSelectedPoints,
  SelectAnalysisResultPending,
  SelectAnalysisResultPrepareDataAge,
  SelectAnalysisResultPrepareDataGender,
  SelectAnalysisResultRedirectTo,
  sendAnalysisData,
  setPrepareDataAge,
  setPrepareDataGender,
} from "@entities/analysisResult";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GenderType } from "@shared/lib/types";
import { DropFile } from "@pages/analysis/Dropfile.tsx";
import {Laboratory} from "@shared/ui/Icons/Laboratory.tsx";
import { CheckIcon } from "@heroicons/react/24/outline";
import {Donwload} from "@shared/ui/Icons/Donwload.tsx";

export const AnalysisPage = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.analysis"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const pending = useAppSelector(SelectAnalysisResultPending);
  const redirectTo = useAppSelector(SelectAnalysisResultRedirectTo);
  const age = useAppSelector(SelectAnalysisResultPrepareDataAge);
  const gender = useAppSelector(SelectAnalysisResultPrepareDataGender);

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

  const handlerAgeSelect = (value: string) => {
    dispatch(setPrepareDataAge(value));
  };

  const handlerGenderSelect = (value: GenderType) => {
    dispatch(setPrepareDataGender(value));
  };

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(sendAnalysisData());
  };

  return (
      <div className="app w-full">
        <div className="mb-8 lg:w-4/12 sm:w-full" id={'preparation'}>
          <h2 className="text-4xl font-sans  text-gray-900 dark:text-white mb-4">
            <Laboratory  className={'inline size-10 mr-3 mb-3'}/>
            {t("pageTitle.analysis")}
          </h2>
          <p className={'text-2xl text-center text-gray-900 dark:text-white mb-4'}>Основные рекомендации:</p>
          <ul className={'text-left'}>
            <li><CheckIcon className="inline h-4 w-4 text-gray-700 dark:text-white" /> минимальные физические нагрузки в течение суток;</li>
            <li><CheckIcon className="inline h-4 w-4 text-gray-700 dark:text-white" /> не принимать алкоголь за трое суток;</li>
            <li><CheckIcon className="inline h-4 w-4 text-gray-700 dark:text-white" /> не курить за пару часов;</li>
            <li><CheckIcon className="inline h-4 w-4 text-gray-700 dark:text-white" /> анализы сдаются натощак (12-14 часов воздержания от приема пищи), желательно соблюдать диетический режим питания (не употреблять острую, жирную, соленую пищу), можно выпить 100-200г теплой воды утром;</li>
          </ul>
        </div>
        <div className="mb-8" id={'analysis'}>
          <h2 className="text-4xl font-sans text-gray-900 dark:text-white mb-4">
            <Donwload className="inline size-10 mr-3 mb-3"/>
            {t("pageTitle.analysis")}
          </h2>
        </div>

        <DropFile/>

        <div className="mx-auto text-left relative lg:w-4/12 sm:w-full">
          <div className="b-border">
            <div className="trail"></div>
          </div>
          <div className="b-border__content">
            <h2 className="text-2xl text-center text-gray-900 dark:text-white mb-4">
              Введите данные
            </h2>
            <form
                className="space-y-2 text-gray-600 dark:text-gray-300"
                onSubmit={handlerSubmit}
            >
              <div className={'flex gap-8'}>
                <GenderSelector gender={gender} setGender={handlerGenderSelect}/>
                <AgeSelector age={age} setAge={handlerAgeSelect}/>
              </div>
              <AnalysisPointList/>

              <button type={"submit"} className={"btn w-full"} disabled={pending}>
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
  );
};
