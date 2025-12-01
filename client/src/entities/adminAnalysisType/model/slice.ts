import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@shared/store";
import Request from "@shared/transport/RestAPI.ts";
import {HandlerAxiosError} from "@shared/transport/RequestHandlersError.ts";
import type {WritableDraft} from "immer";

export const getFullAdminAnalysisTypeList = createAsyncThunk(
    "adminAnalysisType/getFullList",
    async (_, { getState, dispatch }) => {
        const state = getState() as RootState;
        if (!state.adminAnalysisType.pending) {
            dispatch(setPending(true));
            try {
                const response = await Request.get("/analysisType/getFullList", {
                    currentPage: state.adminAnalysisType.currentPage,
                    recordPerPage: state.adminAnalysisType.recordPerPage,
                    filters: state.adminAnalysisType.filters,
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
export interface AdminAnalysisTypeListItem {
    id: number;
    name: string;
    translationRu: string;
    translationEn: string;
}
interface AdminAnalysisTypeState {
    loaded: boolean;
    pending: boolean;
    error: string;
    list: AdminAnalysisTypeListItem[];
    currentPage: number;
    totalRecord: number;
    recordPerPage: number;
    filters: Record<string, string | number>;
}

const initialState : AdminAnalysisTypeState = {
    loaded: false,
    pending: false,
    error: "",
    list: [],
    currentPage: 1,
    totalRecord: 0,
    recordPerPage: 20,
    filters: {},
};

export const adminAnalysisTypeSlice = createSlice({
    name: "adminAnalysisType",
    initialState,
    reducers: {
        setPending: (
            state: WritableDraft<AdminAnalysisTypeState>,
            action: PayloadAction<boolean>,
        ) => {
            state.pending = action.payload;
        },
        setCurrentPage: (
            state: WritableDraft<AdminAnalysisTypeState>,
            action: PayloadAction<number>,
        ) => {
            if (
                action.payload > 0 &&
                action.payload <= Math.ceil(state.totalRecord / state.recordPerPage)
            ) {
                state.currentPage = action.payload;
            }
        },
        resetError: (state: WritableDraft<AdminAnalysisTypeState>) => {
            state.error = "";
        },
    }
});

export const {
    setPending,
    setCurrentPage,
    resetError
} = adminAnalysisTypeSlice.actions;