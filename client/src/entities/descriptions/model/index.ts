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
} from "./slice";
export {
  getDescriptionsList,
  getDescriptionsListWithTranslate,
  addNewDescription,
  deleteDescription,
  editDescription,
} from "./extraReducers";
export type { DescriptionsState, DescriptionsListItem } from "./types";
