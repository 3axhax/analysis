import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import Request from "@shared/transport/RestAPI";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import type { WritableDraft } from "immer";
import { RootState } from "@shared/store";
import { SelectUIOption } from "@shared/ui/SelectUI.tsx";

interface AgesListItem {
  id: number;
  name: string;
  description: string;
}

interface AgesState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AgesListItem[];
}

const initialState: AgesState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
};

export const getAgesList = createAsyncThunk(
  "ages/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (!state.ages.loaded) {
      try {
        const response = await Request.get("/ages");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
    }
  },
);

export const agesSlice = createSlice({
  name: "ages",
  initialState,
  reducers: {},
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
        getAgesList.rejected,
        (state: WritableDraft<AgesState>, action) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(getAgesList.pending, (state: WritableDraft<AgesState>) => {
        state.pending = true;
        state.error = "";
      });
  },
});

//export const {  } = agesSlice.actions;

const selectAgesList = (state: RootState) => state.ages.list;
export const selectAgesPending = (state: RootState) => state.ages.pending;

export const selectAgesListForSelect = createSelector(
  [selectAgesList],
  (agesList): SelectUIOption<string>[] =>
    agesList.map((item) => ({
      value: item.name,
      label: item.name,
    })),
);
