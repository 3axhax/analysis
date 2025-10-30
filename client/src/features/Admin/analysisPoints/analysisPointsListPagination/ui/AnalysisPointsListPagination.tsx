import { Pagination } from "@widgets/pagination";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getFullAnalysisPointList,
  selectAnalysisPointsCurrentPage,
  selectAnalysisPointsTotalPage,
  setCurrentPage,
} from "@entities/analysisPoint";

export const AnalysisPointsListPagination = () => {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(selectAnalysisPointsCurrentPage);
  const totalPages = useAppSelector(selectAnalysisPointsTotalPage);

  const handlerPageSelect = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getFullAnalysisPointList());
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageSelect={handlerPageSelect}
    />
  );
};
