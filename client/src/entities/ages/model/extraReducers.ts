import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending, AgesListItem } from "@entities/ages";

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

export const getAgesListWithTranslate = createAsyncThunk(
  "ages/getListWithTranslate",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/ages/withTranslations", {
          currentPage: state.ages.currentPage,
          recordPerPage: state.ages.recordPerPage,
          filters: state.ages.filters,
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

export const addNewAge = createAsyncThunk(
  "ages/addNew",
  async (data: AgesListItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/ages/add", data);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const editAge = createAsyncThunk(
  "ages/edit",
  async (data: AgesListItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/ages/edit", data);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const deleteAge = createAsyncThunk(
  "ages/delete",
  async (id: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/ages/delete", { id });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);
