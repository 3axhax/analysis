import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import { HandlerAxiosError } from "@shared/transport/RequestHandlersError.ts";
import { setPending } from "@entities/translations/model/slice.ts";
import { TranslationsListItem } from "@entities/translations";

export const getTranslationsList = createAsyncThunk(
  "translations/getList",
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.get("/translations", {
          currentPage: state.translations.currentPage,
          recordPerPage: state.translations.recordPerPage,
          filters: state.translations.filters,
        });
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
      dispatch(setPending(false));
    }
  },
);

export const addNewTranslation = createAsyncThunk(
  "translations/addNew",
  async (data: TranslationsListItem, { getState, dispatch }) => {
    console.log(data);
    const state = getState() as RootState;
    if (!state.ages.pending) {
      dispatch(setPending(true));
      try {
        const response = await Request.post("/translations/add", data);
        return response.data;
      } catch (e) {
        HandlerAxiosError(e);
      }
      dispatch(setPending(false));
    }
  },
);
