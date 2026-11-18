import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError";
import { setPending } from "./slice";

export const getAnalysisPointList = createAsyncThunk(
  "analysisPoint/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (state.analysisPoint.loaded || state.analysisPoint.pending) return;
    dispatch(setPending(true));
    try {
      const response = await Request.get("/analysisPoint");
      return response.data;
    } catch (error) {
      HandlerAxiosError(error);
    } finally {
      dispatch(setPending(false));
    }
  },
);
