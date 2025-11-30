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
} from "./model";
export type { DescriptionsState, DescriptionsListItem } from "./model";
export {
  useDescriptionsLoad,
  useDescriptionsWithTranslateLoad,
} from "./descriptions.hooks.ts";
