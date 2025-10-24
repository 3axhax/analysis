export {
  agesSlice,
  getAgesList,
  getAgesListWithTranslate,
  selectAgesPending,
  selectAgesError,
  selectAgesList,
  selectAgesListForSelect,
  selectAgesCurrentPage,
  selectAgesTotalPage,
  setPending,
  setCurrentPage,
  resetError,
  addNewAge,
  editAge,
  deleteAge,
} from "./model";
export type { AgesListItem, AgesState } from "./model";
export { useAgesLoad, useAgesWithTranslateLoad } from "./ages.hooks.ts";
