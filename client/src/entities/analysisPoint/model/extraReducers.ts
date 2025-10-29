import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "@entities/analysisPoint";

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

export const deleteAnalysisPoint = createAsyncThunk(
  "analysisPoints/delete",
  async (id: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/analysisPoints/delete", { id });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);
