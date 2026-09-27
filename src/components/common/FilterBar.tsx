"use client";

import { useEffect, useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";

interface FilterBarProps {
  children: React.ReactNode;
  /** How many filters currently hold a value, shown on the toggle. */
  activeCount?: number;
  onReset?: () => void;
  className?: string;
}

/**
 * A collapsible row of list filters.
 *
 * Filters are full-width on a phone, so a handful of them push the content
 * they filter off the screen entirely. Two things fix that: they sit two to a
 * row on small screens, and the whole set collapses.
 *
 * It opens by default on a wide screen and stays closed on a narrow one —
 * decided after mount, since the server cannot know the viewport. Rendering
 * closed first means a phone never sees the row flash open and collapse.
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  activeCount = 0,
  onReset,
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setOpen(true);
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <FaFilter className="w-3 h-3 text-slate-400" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold">
              {activeCount}
            </span>
          )}
          <FaChevronDown
            className={`w-2.5 h-2.5 text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Clearing is worth reaching without opening the panel first. */}
        {activeCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 mt-2">
          {children}
        </div>
      )}
    </div>
  );
};
