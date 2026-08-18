import React from "react";
import { ChevronLeft as LuChevronLeft, ChevronRight as LuChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  color?: "brand" | "blue";
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  color = "brand",
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Ensure current page is within valid range
  React.useEffect(() => {
    if (currentPage > totalPages) {
      onPageChange(totalPages);
    }
  }, [totalPages, currentPage, onPageChange]);

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const startEntry = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalItems);

  const activeBgClass =
    color === "blue"
      ? "bg-blue-600 text-white dark:bg-blue-600"
      : "bg-brand-500 text-white dark:bg-brand-500";

  const hoverTextClass =
    color === "blue"
      ? "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
      : "hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:text-brand-400";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
      {/* Left side: Information and Limit Selector */}
      <div className="flex flex-col gap-3 xsm:flex-row xsm:items-center text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing <span className="font-semibold text-gray-800 dark:text-white">{startEntry}</span> to{" "}
          <span className="font-semibold text-gray-800 dark:text-white">{endEntry}</span> of{" "}
          <span className="font-semibold text-gray-800 dark:text-white">{totalItems}</span> entries
        </div>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1); // Reset to page 1
              }}
              className="h-8 rounded-lg border border-gray-200 bg-transparent px-2 text-xs font-medium text-gray-700 outline-hidden focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
            >
              {[10, 25, 50, 100].map((option) => (
                <option
                  key={option}
                  value={option}
                  className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                  {option}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
        )}
      </div>

      {/* Right side: Page Navigation Buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="flex size-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] disabled:opacity-40 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <LuChevronLeft className="size-4" />
        </button>

        {/* Page Buttons */}
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`dots-${idx}`}
                className="flex size-8 items-center justify-center text-gray-400 select-none"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;

          return (
            <button
               // @ts-ignore
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                isCurrent
                  ? `${activeBgClass} shadow-md`
                  : `border border-gray-200 dark:border-gray-800 bg-transparent text-gray-600 dark:text-gray-400 ${hoverTextClass}`
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex size-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03] disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <LuChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
