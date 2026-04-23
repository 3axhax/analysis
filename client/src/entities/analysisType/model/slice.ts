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
import { setSelectedPoint } from "@entities/analysisResult";
import { SelectMultiUIOption } from "@shared/ui/SelectUI.tsx";

interface AnalysisPointItem {
  id: number;
  name: string;
}

interface AnalysisTypeListItem {
  id: number;
  name: string;
  description: string;
  analysisPoint: AnalysisPointItem[];
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
    if (!state.analysisType.loaded) {
      try {
        const response = await Request.get("/analysisType");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
    }
  },
);

export const selectAnalysisType = createAsyncThunk(
  "analysisType/getList",
  async (action: number, { getState, dispatch }) => {
    if (action > 0) {
      const state = getState() as RootState;
      const type = state.analysisType.list.find((item) => item.id === action);
      if (type) {
        dispatch(setSelectedPoint(type.analysisPoint.map((item) => item.id)));
      }
    }
  },
);

export const analysisTypeSlice = createSlice({
  name: "analysisType",
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

//export const { } = analysisTypeSlice.actions;

const selectAnalysisTypeList = (state: RootState) => state.analysisType.list;
export const selectAnalysisTypePending = (state: RootState) =>
  state.analysisType.pending;

const analysisPointsList = (state: RootState) => state.analysisPoint.list;

export const selectAnalysisTypeListForMultiSelect = createSelector(
  [selectAnalysisTypeList, analysisPointsList],
  (analysisTypeList, analysisPointsList): SelectMultiUIOption<number>[] => {
    const groupedPointIds: number[] = [];
    const result = analysisTypeList.map((item) => ({
      label: item.name,
      options: item.analysisPoint.map((point) => {
        groupedPointIds.push(point.id);
        return {
          value: point.id,
          label: point.name,
          group: item.name,
        };
      }),
    }));
    const ungroupedPoints = analysisPointsList.filter(
      (point) => !groupedPointIds.includes(point.id),
    );
    console.log(ungroupedPoints);
    if (ungroupedPoints.length === 0) {
      return result;
    }
    return [
      ...result,
      {
        label: "ungrouped_points",
        options: ungroupedPoints.map((point) => ({
          value: point.id,
          label: point.name,
          group: "ungrouped_points",
        })),
      },
    ];
  },
);
