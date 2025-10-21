export {
  translationsSlice,
  getTranslationsList,
  selectTranslationsCurrentPage,
  selectTranslationsTotalPage,
  setCurrentPage,
} from "./model";
export { useTranslationsLoad } from "./translations.hooks.ts";
export type { TranslationsListItem, TranslationsState } from "./model";
