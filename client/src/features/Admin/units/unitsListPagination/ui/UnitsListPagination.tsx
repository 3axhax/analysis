import { Pagination } from "@widgets/pagination";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getUnitsList,
  selectUnitsCurrentPage,
  selectUnitsTotalPage,
  setCurrentPage,
} from "@entities/units";

export const UnitsListPagination = () => {
  const dispatch = useAppDispatch();

  const currentPage = useAppSelector(selectUnitsCurrentPage);
  const totalPages = useAppSelector(selectUnitsTotalPage);

  const handlerPageSelect = (page: number) => {
    dispatch(setCurrentPage(page));
    dispatch(getUnitsList());
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageSelect={handlerPageSelect}
    />
  );
};
