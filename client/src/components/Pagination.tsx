import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePreviousClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="inline-flex items-center justify-center gap-3">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handlePreviousClick();
        }}
        className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 ${
          currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <span className="sr-only">Previous Page</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </a>

      <p className="text-xs ">
        {currentPage}
        <span className="mx-0.25">/</span>
        {totalPages}
      </p>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          handleNextClick();
        }}
        className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 ${
          currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <span className="sr-only">Next Page</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </div>
  );
};

export default Pagination;
