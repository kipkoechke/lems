"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Page {currentPage} of {totalPages} ({totalItems} total)
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Previous
        </button>
        <span className="text-sm text-slate-600 px-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
