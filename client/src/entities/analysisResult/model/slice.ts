import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import Request from "@shared/transport/RestAPI";
import {
  AnalysisResult,
  AnalysisResultState,
  PreparedData,
} from "@entities/analysisResult/model/types.ts";
import { AnalysisResultReducers } from "@entities/analysisResult/model/reducers.ts";
import type { WritableDraft } from "immer";

export const initialPrepareData: PreparedData = {
  gender: "m",
  age: "",
  pointData: {},
};

const initialState: AnalysisResultState = {
  pending: false,
  error: "",
  preparedData: initialPrepareData,
  results: {},
};

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

export const analysisResultSlice = createSlice({
  name: "analysisResult",
  initialState,
  reducers: AnalysisResultReducers,
  extraReducers: (builder) => {
    builder
      .addCase(
        sendAnalysisData.fulfilled,
        (
          state: WritableDraft<AnalysisResultState>,
          action: PayloadAction<AnalysisResult>,
        ) => {
          console.log(action.payload);
          state.results[action.payload.resultId] = action.payload;
        },
      )
      .addCase(
        sendAnalysisData.rejected,
        (state: WritableDraft<AnalysisResultState>, action) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(
        sendAnalysisData.pending,
        (state: WritableDraft<AnalysisResultState>) => {
          state.error = "";
        },
      );
  },
});

export const {
  setPrepareDataGender,
  setPrepareDataAge,
  resetPrepareData,
  addPointData,
  removePointData,
  clearAllPointData,
  setPending,
} = analysisResultSlice.actions;

export const SelectAnalysisResultPending = (state: RootState) =>
  state.analysisResult.pending;
