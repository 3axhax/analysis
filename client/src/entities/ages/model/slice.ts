import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import { SelectUIOption } from "@shared/ui/SelectUI.tsx";
import {
  AgesListItem,
  AgesState,
  getAgesList,
  getAgesListWithTranslate,
} from "@entities/ages";
import { ErrorActionType } from "@shared/lib/types/errorActionType.ts";

const initialState: AgesState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  currentPage: 1,
  totalRecord: 0,
  recordPerPage: 20,
  filters: {},
};

export const agesSlice = createSlice({
  name: "ages",
  initialState,
  reducers: {
    setPending: (
      state: WritableDraft<AgesState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setCurrentPage: (
      state: WritableDraft<AgesState>,
      action: PayloadAction<number>,
    ) => {
      if (
        action.payload > 0 &&
        action.payload <= Math.ceil(state.totalRecord / state.recordPerPage)
      ) {
        state.currentPage = action.payload;
      }
    },
    resetError: (state: WritableDraft<AgesState>) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getAgesList.fulfilled,
        (
          state: WritableDraft<AgesState>,
          action: PayloadAction<AgesListItem[]>,
        ) => {
          if (action.payload) {
            state.list = action.payload;
            state.loaded = true;
          }
          state.pending = false;
        },
      )
      .addCase(
        getAgesListWithTranslate.fulfilled,
        (
          state: WritableDraft<AgesState>,
          action: PayloadAction<{
            totalRecord: number;
            currentPage: number;
            rows: AgesListItem[];
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
          action.type.endsWith("/rejected") && action.type.startsWith("ages"),
        (state: WritableDraft<AgesState>, action: ErrorActionType) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.startsWith("ages"),
        (state: WritableDraft<AgesState>) => {
          state.error = "";
        },
      );
  },
});

export const { setPending, setCurrentPage, resetError } = agesSlice.actions;

export const selectAgesList = (state: RootState) => state.ages.list;

export const selectAgesError = (state: RootState) => state.ages.error;
export const selectAgesPending = (state: RootState) => state.ages.pending;

export const selectAgesListForSelect = createSelector(
  [selectAgesList],
  (agesList): SelectUIOption<string>[] =>
    agesList.map((item) => ({
      value: item.name,
      label: item.name,
    })),
);

export const selectAgesCurrentPage = (state: RootState) =>
  state.ages.currentPage;

export const selectAgesTotalPage = (state: RootState) =>
  Math.ceil(state.ages.totalRecord / state.ages.recordPerPage);

export const selectAgeById = (state: RootState, id: number) =>
  state.ages.list.find((item) => item.id === id) ?? null;
