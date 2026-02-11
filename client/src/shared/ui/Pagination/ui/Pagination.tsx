import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
}
export const Pagination = ({
  currentPage,
  totalPages,
  onPageSelect,
}: PaginationProps) => {
  const pageButton = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className={"flex gap-1 justify-center m-2"}>
      <button
        className={
          "bg-orange-400 text-white rounded-lg p-1 cursor-pointer transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        }
        disabled={currentPage === 1}
        onClick={() => onPageSelect(currentPage - 1)}
      >
        <ChevronLeftIcon className="h-[20px] w-[20px] text-white" />
      </button>
      {pageButton.map((page) => (
        <button
          key={page}
          className={`bg-orange-600 shadow-sm rounded-lg border-1 border-orange-600 w-7 cursor-pointer hover:shadow-gray-500 disabled:cursor-not-allowed transition-colors disabled:bg-orange-300${currentPage === page ? " bg-white  text-orange-600" : " text-white transition-transform hover:scale-110"}`}
          onClick={() => onPageSelect(page)}
        >
          {page}
        </button>
      ))}
      <button
        className={
          "bg-orange-400 text-white rounded-lg p-1 cursor-pointer hover:bg-orange-600 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300"
        }
        disabled={currentPage >= totalPages}
        onClick={() => onPageSelect(currentPage + 1)}
      >
        <ChevronRightIcon className="h-[20px] w-[20px] text-white" />
      </button>
    </div>
  );
};
