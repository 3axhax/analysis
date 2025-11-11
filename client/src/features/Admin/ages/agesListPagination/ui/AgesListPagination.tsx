import { Pagination } from "@shared/ui/Pagination";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getAgesListWithTranslate,
  selectAgesCurrentPage,
  selectAgesTotalPage,
  setCurrentPage,
} from "@entities/ages";

export const AgesListPagination = () => {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(selectAgesCurrentPage);
  const totalPages = useAppSelector(selectAgesTotalPage);

  const handlerPageSelect = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getAgesListWithTranslate());
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageSelect={handlerPageSelect}
    />
  );
};
