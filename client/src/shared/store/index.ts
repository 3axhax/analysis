import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "@entities/counter";
import { agesSlice } from "@entities/ages";
import {analysisPointSlice} from "@entities/analysisPoint/model/slice.ts";

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    ages: agesSlice.reducer,
    analysisPoint: analysisPointSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
