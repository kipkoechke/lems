"use client";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage?: number;
  from?: number;
  to?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
      <p className="text-sm text-slate-500">
        {from && to ? (
          <>
            Showing {from} to {to} of {total} results
          </>
        ) : (
          <>
            Page {currentPage} of {lastPage} ({total} total)
          </>
        )}
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
          {currentPage} / {lastPage}
        </span>
        <button
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage >= lastPage}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
