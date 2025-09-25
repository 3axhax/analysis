import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "@entities/counter";
import { agesSlice } from "@entities/ages";
import { analysisPointSlice } from "@entities/analysisPoint/model/slice.ts";
import { analysisTypeSlice } from "@entities/analysisType/model/slice.ts";

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    ages: agesSlice.reducer,
    analysisPoint: analysisPointSlice.reducer,
    analysisType: analysisTypeSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
