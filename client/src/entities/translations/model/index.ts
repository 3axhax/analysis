export {
  translationsSlice,
  selectTranslationsCurrentPage,
  selectTranslationsTotalPage,
  setCurrentPage,
} from "./slice";
export type {
  TranslationsListItem,
  TranslationsState,
  TranslationLangType,
} from "./types.ts";
export {
  getTranslationsList,
  addNewTranslation,
  editTranslation,
} from "./extraReducers.ts";
