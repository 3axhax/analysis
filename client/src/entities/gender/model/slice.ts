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
import { RadioOption } from "@shared/ui/RadioGroup.tsx";

export type GenderType = "m" | "f" | "fp";

interface GenderListItem {
  id: number;
  name: GenderType;
}

interface GenderState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: GenderListItem[];
}

const initialState: GenderState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
};

export const getGenderList = createAsyncThunk(
  "gender/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (!state.gender.loaded) {
      try {
        const response = await Request.get("/gender");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
    }
  },
);

export const genderSlice = createSlice({
  name: "gender",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getGenderList.fulfilled,
        (
          state: WritableDraft<GenderState>,
          action: PayloadAction<GenderListItem[]>,
        ) => {
          if (action.payload) {
            state.list = action.payload;
            state.loaded = true;
          }
          state.pending = false;
        },
      )
      .addCase(
        getGenderList.rejected,
        (state: WritableDraft<GenderState>, action) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(getGenderList.pending, (state: WritableDraft<GenderState>) => {
        state.pending = true;
        state.error = "";
      });
  },
});

//export const {  } = agesSlice.actions;

const selectGenderList = (state: RootState) => state.gender.list;
export const selectGenderPending = (state: RootState) => state.gender.pending;

export const selectGenderListForSelect = createSelector(
  [selectGenderList],
  (genderList): RadioOption<GenderType>[] =>
    genderList.map((item) => ({
      value: item.name,
      label: item.name,
    })),
);
