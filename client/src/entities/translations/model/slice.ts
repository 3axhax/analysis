import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import Request from "@shared/transport/RestAPI";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";

interface TranslationsListItem {
  id: number;
  name: string;
  description: string;
}

interface TranslationsState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: TranslationsListItem[];
  currentPage: number;
  totalRecord: number;
  recordPerPage: number;
  filters: Record<string, string | number>;
}

const initialState: TranslationsState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  currentPage: 1,
  totalRecord: 0,
  recordPerPage: 20,
  filters: {
    name: "test",
    name1: "test1",
    name2: "test2",
    name3: "test3",
  },
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getTranslationsList.fulfilled,
        (
          state: WritableDraft<TranslationsState>,
          action: PayloadAction<TranslationsListItem[]>,
        ) => {
          if (action.payload) {
            state.list = action.payload;
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

export const { setPending } = translationsSlice.actions;

export const selectTranslationsList = (state: RootState) =>
  state.translations.list;
