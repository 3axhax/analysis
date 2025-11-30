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
  selectEditDescriptionId,
  selectEditDescription,
} from "./slice";
export {
  getDescriptionsList,
  getDescriptionsListWithTranslate,
  addNewDescription,
  deleteDescription,
  editDescription,
} from "./extraReducers";
export type {
  DescriptionsState,
  DescriptionsListItem,
  DescriptionGreatItem,
  DescriptionCondition,
} from "./types";
