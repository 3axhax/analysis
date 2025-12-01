import { Pagination } from "@shared/ui/Pagination";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getFullAdminAnalysisTypeList,
  selectAnalysisTypeCurrentPage,
  selectAnalysisTypeTotalPage,
  setCurrentPage,
} from "@entities/adminAnalysisType";

export const AnalysisTypeListPagination = () => {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(selectAnalysisTypeCurrentPage);
  const totalPages = useAppSelector(selectAnalysisTypeTotalPage);

  const handlerPageSelect = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getFullAdminAnalysisTypeList());
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageSelect={handlerPageSelect}
    />
  );
};
