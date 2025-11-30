import {
  getDescriptionsListWithTranslate,
  DescriptionsListItem,
  DescriptionsState,
} from "@entities/descriptions";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/lib/types";
import { getDescriptionsList } from "@entities/descriptions/model/extraReducers.ts";

const initialState: DescriptionsState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  currentPage: 1,
  totalRecord: 0,
  recordPerPage: 20,
  filters: {},
  editDescriptionId: 0,
};

export const descriptionsSlice = createSlice({
  name: "descriptions",
  initialState,
  reducers: {
    setPending: (
      state: WritableDraft<DescriptionsState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setCurrentPage: (
      state: WritableDraft<DescriptionsState>,
      action: PayloadAction<number>,
    ) => {
      if (
        action.payload > 0 &&
        action.payload <= Math.ceil(state.totalRecord / state.recordPerPage)
      ) {
        state.currentPage = action.payload;
      }
    },
    resetError: (state: WritableDraft<DescriptionsState>) => {
      state.error = "";
    },
    setEditDescriptionId: (
      state: WritableDraft<DescriptionsState>,
      action: PayloadAction<number | undefined>,
    ) => {
      state.editDescriptionId =
        action.payload && action.payload > 0 ? action.payload : 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getDescriptionsList.fulfilled,
        (
          state: WritableDraft<DescriptionsState>,
          action: PayloadAction<DescriptionsListItem[]>,
        ) => {
          if (action.payload) {
            state.list = action.payload;
            state.loaded = true;
          }
          state.pending = false;
        },
      )
      .addCase(
        getDescriptionsListWithTranslate.fulfilled,
        (
          state: WritableDraft<DescriptionsState>,
          action: PayloadAction<{
            totalRecord: number;
            currentPage: number;
            rows: DescriptionsListItem[];
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
          action.type.startsWith("descriptions"),
        (state: WritableDraft<DescriptionsState>, action: ErrorActionType) => {
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          action.type.startsWith("descriptions"),
        (state: WritableDraft<DescriptionsState>) => {
          state.error = "";
        },
      );
  },
});

export const { setPending, setCurrentPage, resetError, setEditDescriptionId } =
  descriptionsSlice.actions;

export const selectDescriptionsList = (state: RootState) =>
  state.descriptions.list;

export const selectDescriptionsError = (state: RootState) =>
  state.descriptions.error;

export const selectDescriptionsCurrentPage = (state: RootState) =>
  state.descriptions.currentPage;
export const selectDescriptionsTotalPage = (state: RootState) =>
  Math.ceil(state.descriptions.totalRecord / state.descriptions.recordPerPage);

export const selectDescriptionById = (state: RootState, id: number) =>
  state.descriptions.list.find((item) => item.id === id) ?? null;

export const selectConditionsDescriptionById = createSelector(
  [selectDescriptionById],
  (description) => {
    if (!description) return [];
    return description.analysisResultDescriptionConditions;
  },
);
