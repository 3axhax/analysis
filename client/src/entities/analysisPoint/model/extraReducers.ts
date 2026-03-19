import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import {
  AnalysisPointFormatedLimit,
  AnalysisPointGreatItem,
  AnalysisPointGreatItemFormated,
  setPending,
} from "@entities/analysisPoint";
import { GenderType } from "@shared/lib/types";

export const getAnalysisPointList = createAsyncThunk(
  "analysisPoint/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (!state.analysisPoint.loaded) {
      try {
        const response = await Request.get("/analysisPoint");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
    }
  },
);

export const getFullAnalysisPointList = createAsyncThunk(
  "analysisPoint/getFullList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.analysisPoint.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/analysisPoint/getFullList", {
          currentPage: state.analysisPoint.currentPage,
          recordPerPage: state.analysisPoint.recordPerPage,
          filters: state.analysisPoint.filters,
        });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const addNewAnalysisPoint = createAsyncThunk(
  "analysisPoint/addNew",
  async (data: AnalysisPointGreatItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post(
          "/analysisPoint/add",
          formatAnalysisPointLimits(data),
        );
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const editAnalysisPoint = createAsyncThunk(
  "analysisPoint/edit",
  async (data: AnalysisPointGreatItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post(
          "/analysisPoint/edit",
          formatAnalysisPointLimits(data),
        );
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const deleteAnalysisPoint = createAsyncThunk(
  "analysisPoint/delete",
  async (id: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/analysisPoint/delete", { id });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

const formatAnalysisPointLimits = (
  data: AnalysisPointGreatItem,
): AnalysisPointGreatItemFormated => {
  return {
    ...data,
    limits: data.limits.reduce((acc, limit) => {
      limit.age.forEach((age: string) => {
        limit.gender.forEach((gender: GenderType) => {
          acc.push({
            ...limit,
            age: age,
            gender: gender,
          });
        });
      });
      return acc;
    }, [] as AnalysisPointFormatedLimit[]),
  };
};
