import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "@entities/user";
import { counterSlice } from "@entities/counter";
import { agesSlice } from "@entities/ages";
import { analysisPointSlice } from "@entities/analysisPoint";
import { analysisTypeSlice } from "@entities/analysisType";
import { genderSlice } from "@entities/gender";
import { analysisResultSlice } from "@entities/analysisResult";
import { translationsSlice } from "@entities/translations";
import { unitsSlice } from "@entities/units";

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    counter: counterSlice.reducer,
    ages: agesSlice.reducer,
    gender: genderSlice.reducer,
    analysisPoint: analysisPointSlice.reducer,
    analysisType: analysisTypeSlice.reducer,
    analysisResult: analysisResultSlice.reducer,
    translations: translationsSlice.reducer,
    units: unitsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
