import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import Request from "@shared/transport/RestAPI";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import {
  TranslationsListItem,
  TranslationsState,
} from "@entities/translations";

const initialState: TranslationsState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  currentPage: 1,
  totalRecord: 0,
  recordPerPage: 20,
  filters: {},
};

export const getTranslationsList = createAsyncThunk(
  "translations/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/translations", {
          currentPage: state.translations.currentPage,
          recordPerPage: state.translations.recordPerPage,
          filters: state.translations.filters,
        });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
      dispatch(setPending(false));
    }
  },
);

export const translationsSlice = createSlice({
  name: "translations",
  initialState,
  reducers: {
    setPending: (
      state: WritableDraft<TranslationsState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setCurrentPage: (
      state: WritableDraft<TranslationsState>,
      action: PayloadAction<number>,
    ) => {
      if (
        action.payload > 0 &&
        action.payload <= Math.ceil(state.totalRecord / state.recordPerPage)
      ) {
        state.currentPage = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getTranslationsList.fulfilled,
        (
          state: WritableDraft<TranslationsState>,
          action: PayloadAction<{
            totalRecord: number;
            currentPage: number;
            rows: TranslationsListItem[];
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
      .addCase(
        getTranslationsList.rejected,
        (state: WritableDraft<TranslationsState>, action) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(
        getTranslationsList.pending,
        (state: WritableDraft<TranslationsState>) => {
          state.pending = true;
          state.error = "";
        },
      );
  },
});

export const { setPending, setCurrentPage } = translationsSlice.actions;

export const selectTranslationsList = (state: RootState) =>
  state.translations.list;

export const selectTranslationsCurrentPage = (state: RootState) =>
  state.translations.currentPage;
export const selectTranslationsTotalPage = (state: RootState) =>
  Math.ceil(state.translations.totalRecord / state.translations.recordPerPage);
