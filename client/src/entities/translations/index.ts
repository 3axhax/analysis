export {
  translationsSlice,
  getTranslationsList,
  addNewTranslation,
  editTranslation,
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
