export {
  translationsSlice,
  getTranslationsList,
  addNewTranslation,
  editTranslation,
  deleteTranslation,
  selectTranslationsCurrentPage,
  selectTranslationsTotalPage,
  setCurrentPage,
} from "./model";
export { useTranslationsLoad } from "./translations.hooks.ts";
export type {
  TranslationsListItem,
  TranslationsState,
  TranslationLangType,
} from "./model";
