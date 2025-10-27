export {
  agesSlice,
  selectAgesPending,
  selectAgesError,
  selectAgesList,
  selectAgesListForSelect,
  selectAgesCurrentPage,
  selectAgesTotalPage,
  selectAgeById,
  setPending,
  setCurrentPage,
  resetError,
} from "./slice";
export type { AgesListItem, AgesState } from "./types";
export {
  getAgesList,
  getAgesListWithTranslate,
  addNewAge,
  editAge,
  deleteAge,
} from "./extraReducers";
