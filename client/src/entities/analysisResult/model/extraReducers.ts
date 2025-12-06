import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "@entities/analysisResult";

export const sendAnalysisData = createAsyncThunk(
  "analysisResult/sendData",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.analysisResult.pending) {
      try {
        dispatch(setPending(true));
        const gender = state.analysisResult.preparedData.gender;
        const age = state.analysisResult.preparedData.age;
        const pointData = state.analysisResult.preparedData.pointData;
        const response = await Request.post("/result/save", {
          gender,
          age,
          pointData: Object.values(pointData),
        });
        dispatch(setPending(false));
        return response.data;
      } catch (e) {
        dispatch(setPending(false));
        HandlerAxiosError(e);
      }
    }
  },
);

export const getAnalysisResult = createAsyncThunk(
  "analysisResult/getData",
  async (resultId: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.analysisResult.pending && resultId !== "") {
      try {
        dispatch(setPending(true));
        const response = await Request.post("/result/get", {
          resultId,
        });
        dispatch(setPending(false));
        return response.data;
      } catch (e) {
        dispatch(setPending(false));
        HandlerAxiosError(e);
      }
    }
  },
);

export const sendAnalysisResultFile = createAsyncThunk(
  "analysisResult/sendAnalysisResultFile",
  async (file: File, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.analysisResult.pending) {
      try {
        dispatch(setPending(true));
        const response = await Request.post("/result/fromFile", { file: file });
        dispatch(setPending(false));
        return response.data;
      } catch (e) {
        dispatch(setPending(false));
        HandlerAxiosError(e);
      }
    }
  },
);
