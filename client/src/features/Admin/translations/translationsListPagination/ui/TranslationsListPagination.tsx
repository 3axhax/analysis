import { Pagination } from "@shared/ui/Pagination";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getTranslationsList,
  selectTranslationsCurrentPage,
  selectTranslationsTotalPage,
  setCurrentPage,
} from "@entities/translations";

export const TranslationsListPagination = () => {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(selectTranslationsCurrentPage);
  const totalPages = useAppSelector(selectTranslationsTotalPage);

  const handlerPageSelect = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getTranslationsList());
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageSelect={handlerPageSelect}
    />
  );
};
