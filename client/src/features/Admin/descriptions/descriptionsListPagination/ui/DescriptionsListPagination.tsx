import { Pagination } from "@shared/ui/Pagination";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getDescriptionsListWithTranslate,
  selectDescriptionsCurrentPage,
  selectDescriptionsTotalPage,
  setCurrentPage,
} from "@entities/descriptions";

export const DescriptionsListPagination = () => {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(selectDescriptionsCurrentPage);
  const totalPages = useAppSelector(selectDescriptionsTotalPage);

  const handlerPageSelect = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getDescriptionsListWithTranslate());
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageSelect={handlerPageSelect}
    />
  );
};
