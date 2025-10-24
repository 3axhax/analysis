import { getUnitsList, UnitsListItem, UnitsState } from "@entities/units";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import { ErrorActionType } from "@shared/lib/types/errorActionType.ts";

const initialState: UnitsState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
  currentPage: 1,
  totalRecord: 0,
  recordPerPage: 20,
  filters: {},
};

export const unitsSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    setPending: (
      state: WritableDraft<UnitsState>,
      action: PayloadAction<boolean>,
    ) => {
      state.pending = action.payload;
    },
    setCurrentPage: (
      state: WritableDraft<UnitsState>,
      action: PayloadAction<number>,
    ) => {
      if (
        action.payload > 0 &&
        action.payload <= Math.ceil(state.totalRecord / state.recordPerPage)
      ) {
        state.currentPage = action.payload;
      }
    },
    resetError: (state: WritableDraft<UnitsState>) => {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getUnitsList.fulfilled,
        (
          state: WritableDraft<UnitsState>,
          action: PayloadAction<{
            totalRecord: number;
            currentPage: number;
            rows: UnitsListItem[];
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
        (action) => action.type.endsWith("/rejected"),
        (state: WritableDraft<UnitsState>, action: ErrorActionType) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state: WritableDraft<UnitsState>) => {
          state.pending = true;
          state.error = "";
        },
      );
  },
});

export const { setPending, setCurrentPage, resetError } = unitsSlice.actions;

export const selectUnitsList = (state: RootState) => state.units.list;

export const selectUnitsError = (state: RootState) => state.units.error;

export const selectUnitsCurrentPage = (state: RootState) =>
  state.units.currentPage;
export const selectUnitsTotalPage = (state: RootState) =>
  Math.ceil(state.units.totalRecord / state.units.recordPerPage);

export const selectUnitById = (state: RootState, id: number) =>
  state.units.list.find((item) => item.id === id) ?? null;
