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

interface AnalysisTypeListItem {
  id: number;
  name: string;
  description: string;
  analysisPointList: number[];
}

interface AnalysisTypeState {
  loaded: boolean;
  pending: boolean;
  error: string;
  list: AnalysisTypeListItem[];
}

const initialState: AnalysisTypeState = {
  loaded: false,
  pending: false,
  error: "",
  list: [],
};

export const getAnalysisTypeList = createAsyncThunk(
  "analysisType/getList",
  async (_, { getState }) => {
    const state = getState() as RootState;
    if (!state.ages.loaded) {
      try {
        const response = await Request.get("/analysisType");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
    }
  },
);

export const analysisTypeSlice = createSlice({
  name: "ages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getAnalysisTypeList.fulfilled,
        (
          state: WritableDraft<AnalysisTypeState>,
          action: PayloadAction<AnalysisTypeListItem[]>,
        ) => {
          if (action.payload) {
            state.list = action.payload;
            state.loaded = true;
          }
          state.pending = false;
        },
      )
      .addCase(
        getAnalysisTypeList.rejected,
        (state: WritableDraft<AnalysisTypeState>, action) => {
          state.pending = false;
          state.error = action.error.message ? action.error.message : "";
        },
      )
      .addCase(
        getAnalysisTypeList.pending,
        (state: WritableDraft<AnalysisTypeState>) => {
          state.pending = true;
          state.error = "";
        },
      );
  },
});

//export const {  } = agesSlice.actions;

const selectAnalysisTypeList = (state: RootState) => state.analysisType.list;
export const selectAnalysisTypePending = (state: RootState) =>
  state.analysisType.pending;

export const selectAnalysisTypeListForSelect = createSelector(
  [selectAnalysisTypeList],
  (agesList): SelectUIOption<number>[] =>
    agesList.map((item) => ({
      value: item.id,
      label: item.name,
    })),
);
