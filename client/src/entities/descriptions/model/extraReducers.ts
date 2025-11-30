import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "@entities/descriptions/model/slice.ts";
import { DescriptionsListItem } from "@entities/descriptions";

export const getDescriptionsList = createAsyncThunk(
  "descriptions/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.descriptions.loaded && !state.descriptions.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/descriptions");
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const getDescriptionsListWithTranslate = createAsyncThunk(
  "descriptions/getListWithTranslate",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.descriptions.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/descriptions/withTranslations", {
          currentPage: state.descriptions.currentPage,
          recordPerPage: state.descriptions.recordPerPage,
          filters: state.descriptions.filters,
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

export const addNewDescription = createAsyncThunk(
  "descriptions/addNew",
  async (data: DescriptionsListItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.descriptions.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/descriptions/add", data);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const editDescription = createAsyncThunk(
  "descriptions/edit",
  async (data: DescriptionsListItem, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.descriptions.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/descriptions/edit", data);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);

export const deleteDescription = createAsyncThunk(
  "descriptions/delete",
  async (id: number, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.descriptions.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/descriptions/delete", { id });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      } finally {
        dispatch(setPending(false));
      }
    }
  },
);
