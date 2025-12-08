import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "@entities/units/model/slice.ts";
import { UnitsListItem } from "@entities/units";

export const getUnitsList = createAsyncThunk(
  "units/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.units.loaded && !state.units.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/units");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const getUnitsListWithTranslate = createAsyncThunk(
  "units/getListWithTranslate",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.units.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/units/withTranslations", {
          currentPage: state.units.currentPage,
          recordPerPage: state.units.recordPerPage,
          filters: state.units.filters,
        });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const addNewUnit = createAsyncThunk(
  "units/addNew",
  async (data: UnitsListItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.units.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post<UnitsListItem>("/units/add", data);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const editUnit = createAsyncThunk(
  "units/edit",
  async (data: UnitsListItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.units.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post<UnitsListItem>("/units/edit", data);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const deleteUnit = createAsyncThunk(
  "units/delete",
  async (id: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.units.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/units/delete", { id });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);
