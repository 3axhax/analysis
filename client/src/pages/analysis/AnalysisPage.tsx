import React, { useEffect } from "react";
import useDocumentTitle from "@shared/hooks/useDocumentTitle";
import { GenderSelector } from "@features/genderSelector";
import { AgeSelector } from "@features/ageSelector";
import { AnalysisPointList } from "@features/analysisPointList";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import {
  clearRedirect,
  resetPrepareData,
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
      <div className="mb-8">
        <h1 className="text-4xl font-sans  text-gray-900 dark:text-white mb-4">
          {t("pageTitle.analysis")}
        </h1>
      </div>

      <div className="mx-auto text-left relative lg:w-4/12">
        <div className="b-border">
          <div className="trail"></div>
        </div>
        <div className="b-border__content">
          <h2 className="text-2xl font-sofia font-weight-450 text-gray-900 dark:text-white mb-4">
            Введите данные
          </h2>
          <form
            className="space-y-2 text-gray-600 dark:text-gray-300"
            onSubmit={handlerSubmit}
          >
            <GenderSelector gender={gender} setGender={handlerGenderSelect} />
            <AgeSelector age={age} setAge={handlerAgeSelect} />
            <AnalysisPointList />

            <button type={"submit"} className={"btn w-full"} disabled={pending}>
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
