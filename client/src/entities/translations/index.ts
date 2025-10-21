export {
  translationsSlice,
  getTranslationsList,
  addNewTranslation,
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
