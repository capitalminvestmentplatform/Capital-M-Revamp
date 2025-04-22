import React from "react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null; // Hide pagination if only one page

  const pageNumbers = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
      <button
        className="px-2 py-1 border border-gray-300 bg-white text-gray-800 text-sm font-bold rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {startPage > 1 && (
        <>
          <button
            className="px-2 py-1 border border-gray-300 bg-white text-gray-800 text-sm rounded hover:bg-gray-100"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {startPage > 2 && <span className="text-sm text-gray-500">...</span>}
        </>
      )}

      {pageNumbers.map((number) => (
        <button
          key={number}
          className={`px-2 py-1 border text-sm rounded  ${
            number === currentPage
              ? "bg-teal-700 text-white font-bold border-teal-700"
              : "bg-white text-gray-800 border-gray-300"
          }`}
          onClick={() => onPageChange(number)}
        >
          {number}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="text-sm text-gray-500">...</span>
          )}
          <button
            className="px-2 py-1 border border-gray-300 bg-white text-gray-800 text-sm rounded hover:bg-gray-100"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="px-2 py-1 border border-gray-300 bg-white text-gray-800 text-sm font-bold rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default CustomPagination;
