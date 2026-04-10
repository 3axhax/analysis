export {
  descriptionsSlice,
  setPending,
  setCurrentPage,
  resetError,
  setEditDescriptionId,
  selectDescriptionsError,
  selectDescriptionsCurrentPage,
  selectDescriptionsList,
  selectDescriptionsTotalPage,
  selectDescriptionById,
  selectConditionsDescriptionById,
  getDescriptionsListWithTranslate,
  addNewDescription,
  deleteDescription,
  editDescription,
  selectEditDescriptionId,
  selectEditDescription,
  setFilters,
} from "./model";
export type {
  DescriptionsState,
  DescriptionsListItem,
  DescriptionGreatItem,
  DescriptionCondition,
} from "./model";
export {
  useDescriptionsLoad,
  useDescriptionsWithTranslateLoad,
} from "./descriptions.hooks.ts";
