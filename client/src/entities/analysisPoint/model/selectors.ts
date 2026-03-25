import { RootState } from "@shared/store";
import { createSelector } from "@reduxjs/toolkit";
import { SelectUIOption } from "@shared/ui";
import {
  AnalysisPointFormatedLimit,
  AnalysisPointGreatItem,
  AnalysisPointLimit,
} from "@entities/analysisPoint";

export const selectAnalysisPointList = (state: RootState) =>
  state.analysisPoint.list;
export const selectAnalysisPointPending = (state: RootState) =>
  state.analysisPoint.pending;

export const selectAnalysisPointById = (state: RootState, pointId: number) =>
  state.analysisPoint.list.find((point) => point.id === pointId);

export const selectAnalysisPointListForSelect = createSelector(
  [selectAnalysisPointList],
  (analysisPointList): SelectUIOption<number>[] =>
    analysisPointList.map((item) => ({
      value: item.id,
      label: item.name,
    })),
);

export const selectAnalysisPointsError = (state: RootState) =>
  state.analysisPoint.error;

export const selectAnalysisPointsCurrentPage = (state: RootState) =>
  state.analysisPoint.currentPage;

export const selectAnalysisPointsTotalPage = (state: RootState) =>
  Math.ceil(
    state.analysisPoint.totalRecord / state.analysisPoint.recordPerPage,
  );

export const selectAnalysisPointLimits = createSelector(
  [selectAnalysisPointById],
  (analysisPoint) => {
    if (
      !analysisPoint ||
      !analysisPoint.limits ||
      analysisPoint.limits.length === 0
    )
      return [];
    const sortLimits = [...analysisPoint.limits].sort((a, b) => {
      if (a.unit !== b.unit) {
        return a.unit.localeCompare(b.unit);
      }
      if (a.age.slice(-1) !== b.age.slice(-1))
        return a.age.slice(-1).localeCompare(b.age.slice(-1));
      if (isNaN(parseInt(a.age))) return 1;
      return parseInt(a.age) > parseInt(b.age) ? 1 : -1;
    });
    return sortLimits.map((limit, i) => {
      const formatedLimit: AnalysisPointFormatedLimit = { ...limit };
      if (sortLimits[i + 1] && sortLimits[i + 1].age === limit.age) {
        formatedLimit.skipAge = true;
        if (
          sortLimits[i + 1].maxValue === limit.maxValue &&
          sortLimits[i + 1].minValue === limit.minValue
        ) {
          formatedLimit.skipGender = true;
        }
      }
      return formatedLimit;
    });
  },
);

export const selectAnalysisPointsEditAnalysisPointId = (state: RootState) =>
  state.analysisPoint.editAnalysisPointId;

export const selectAnalysisPointsEditAnalysisPoint = createSelector(
  [selectAnalysisPointList, selectAnalysisPointsEditAnalysisPointId],
  (list, editableId) =>
    editableId > 0 ? list.find((point) => point.id === editableId) : undefined,
);

export const selectAnalysisPointsEditAnalysisPointFormatLimits = createSelector(
  [selectAnalysisPointsEditAnalysisPoint],
  (point): AnalysisPointGreatItem | undefined => {
    if (point) {
      const genderLimits = point.limits.reduce((acc, limit) => {
        const index = acc.findIndex(
          (exist: AnalysisPointLimit) =>
            exist.minValue === limit.minValue &&
            exist.maxValue === limit.maxValue &&
            exist.unit === limit.unit &&
            exist.gender.includes(limit.gender),
        );
        if (index !== -1) {
          acc[index] = {
            ...acc[index],
            age: [...acc[index].age, limit.age],
          };
        } else {
          acc.push({
            ...limit,
            age: [limit.age],
            gender: [limit.gender],
          });
        }
        return acc;
      }, [] as AnalysisPointLimit[]);
      const limits = genderLimits.reduce((acc, limit) => {
        const index = acc.findIndex(
          (exist: AnalysisPointLimit) =>
            exist.minValue === limit.minValue &&
            exist.maxValue === limit.maxValue &&
            exist.unit === limit.unit,
        );
        if (index !== -1) {
          if (limit.age.length === acc[index].age.length) {
            const age1 = [...limit.age].sort();
            const age2 = [...acc[index].age].sort();

            if (age1.every((value, i) => value === age2[i])) {
              acc[index] = {
                ...acc[index],
                gender: [...acc[index].gender, ...limit.gender],
              };
              return acc;
            }
          }
        }
        return [...acc, limit];
      }, [] as AnalysisPointLimit[]);
      return {
        ...point,
        limits: limits,
      };
    } else return undefined;
  },
);
