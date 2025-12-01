import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { ErrorActionType } from "@shared/lib/types";

export const getFullAdminAnalysisTypeList = createAsyncThunk(
  "adminAnalysisType/getFullList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.adminAnalysisType.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/analysisType/getFullList", {
          currentPage: state.adminAnalysisType.currentPage,
          recordPerPage: state.adminAnalysisType.recordPerPage,
          filters: state.adminAnalysisType.filters,
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

export interface AdminAnalysisTypePointItem {
  id: number;
  name: string;
}

export interface AdminAnalysisTypeListItem {
  id: number;
  name: string;
  translationRu: string;
  translationEn: string;
  analysisPoint: AdminAnalysisTypePointItem[];
}
interface AdminAnalysisTypeState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AdminAnalysisTypeListItem[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
}

const initialState: AdminAnalysisTypeState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  currentPage: 1,
  totalRecord: 0,
  recordPerPage: 10,
  filters: {},
};

export const adminAnalysisTypeSlice = createSlice({
  name: "adminAnalysisType",
  initialState,
  reducers: {
    setPending: (
      state: WritableDraft<AdminAnalysisTypeState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setCurrentPage: (
      state: WritableDraft<AdminAnalysisTypeState>,
      action: PayloadAction<number>,
    ) => {
      if (
        action.payload > 0 &&
        action.payload <= Math.ceil(state.totalRecord / state.recordPerPage)
      ) {
        state.currentPage = action.payload;
      }
    },
    resetError: (state: WritableDraft<AdminAnalysisTypeState>) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getFullAdminAnalysisTypeList.fulfilled,
        (
          state: WritableDraft<AdminAnalysisTypeState>,
          action: PayloadAction<{
            totalRecord: number;
            currentPage: number;
            rows: AdminAnalysisTypeListItem[];
          }>,
        ) => {
          if (action.payload) {
            state.list = action.payload.rows;
            state.totalRecord = action.payload.totalRecord;
            state.loaded = true;
          }
          state.pending = false;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("adminAnalysisType"),
        (
          state: WritableDraft<AdminAnalysisTypeState>,
          action: ErrorActionType,
        ) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("adminAnalysisType"),
        (state: WritableDraft<AdminAnalysisTypeState>) => {
          state.error = "";
        },
      );
  },
});

export const { setPending, setCurrentPage, resetError } =
  adminAnalysisTypeSlice.actions;

export const selectAdminAnalysisTypeError = (state: RootState) =>
  state.adminAnalysisType.error;

export const selectAdminAnalysisTypeList = (state: RootState) =>
  state.adminAnalysisType.list;
export const selectAnalysisTypeCurrentPage = (state: RootState) =>
  state.adminAnalysisType.currentPage;
export const selectAnalysisTypeTotalPage = (state: RootState) =>
  Math.ceil(
    state.adminAnalysisType.totalRecord / state.adminAnalysisType.recordPerPage,
  );
