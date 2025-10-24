import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import {
  getTranslationsList,
  TranslationsListItem,
  TranslationsState,
} from "@entities/translations";
import { ErrorActionType } from "@shared/lib/types/errorActionType.ts";

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
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          action.type.startsWith("translations"),
        (state: WritableDraft<TranslationsState>, action: ErrorActionType) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("translations"),
        (state: WritableDraft<TranslationsState>) => {
          state.error = "";
        },
      );
  },
});

export const { setPending, setCurrentPage } = translationsSlice.actions;

export const selectTranslationsList = (state: RootState) =>
  state.translations.list;

export const selectTranslationsError = (state: RootState) =>
  state.translations.error;

export const selectTranslationsCurrentPage = (state: RootState) =>
  state.translations.currentPage;
export const selectTranslationsTotalPage = (state: RootState) =>
  Math.ceil(state.translations.totalRecord / state.translations.recordPerPage);

export const selectTranslationById = (state: RootState, id: number) =>
  state.translations.list.find((item) => item.id === id) ?? null;
