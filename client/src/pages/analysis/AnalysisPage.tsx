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
import { useTranslation } from "react-i18next";

export const AnalysisPage = () => {
  const { t } = useTranslation("common");
  useDocumentTitle(t("pageTitle.analysis"));
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
        <h1 className="text-4xl font-sans  text-gray-900 dark:text-white mb-4">
          {t("pageTitle.analysis")}
        </h1>
      </div>

      <div className="mx-auto text-left relative">
        <div className="b-border">
          <div className="trail"></div>
        </div>
        <div className="b-border__content">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Введите данные
          </h2>
          <form
            className="space-y-2 text-gray-600 dark:text-gray-300"
            onSubmit={handlerSubmit}
          >
            <GenderSelector />
            <AgeSelector />
            <hr />
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
