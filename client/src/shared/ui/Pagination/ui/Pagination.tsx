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
          "bg-green-600 text-white rounded-lg p-1 cursor-pointer hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
        }
        disabled={currentPage === 1}
        onClick={() => onPageSelect(currentPage - 1)}
      >
        <ChevronLeftIcon className="h-[20px] w-[20px] text-white" />
      </button>
      {pageButton.map((page) => (
        <button
          key={page}
          className={`bg-green-600 text-white rounded-lg p-1 w-[30px] cursor-pointer hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300${currentPage === page ? " bg-green-900" : ""}`}
          onClick={() => onPageSelect(page)}
        >
          {page}
        </button>
      ))}
      <button
        className={
          "bg-green-600 text-white rounded-lg p-1 cursor-pointer hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-green-300"
        }
        disabled={currentPage >= totalPages}
        onClick={() => onPageSelect(currentPage + 1)}
      >
        <ChevronRightIcon className="h-[20px] w-[20px] text-white" />
      </button>
    </div>
  );
};
