import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "@entities/counter";
import { agesSlice } from "@entities/ages";

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    ages: agesSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
