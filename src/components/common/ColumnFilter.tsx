"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdExpandMore, MdSearch } from "react-icons/md";

export interface ColumnFilterOption {
  value: string;
  label: string;
}

interface ColumnFilterProps {
  /** The column heading this filter sits in, e.g. "Status". */
  label: string;
  options: ColumnFilterOption[];
  value: string;
  onChange: (value: string) => void;
  /** Label for the "no filter" entry, e.g. "All Status". */
  allLabel?: string;
  searchPlaceholder?: string;
  /** Hide the search box for very short option lists. */
  searchable?: boolean;
}

/**
 * A filter control that lives inside a table column heading rather than in a
 * separate toolbar, so the filter sits with the data it filters.
 *
 * The dropdown renders in a portal because the table scroll container uses
 * `overflow-x-auto`, which would otherwise clip a panel positioned inside the
 * `<th>`.
 */
export const ColumnFilter: React.FC<ColumnFilterProps> = ({
  label,
  options,
  value,
  onChange,
  allLabel,
  searchPlaceholder = "Search...",
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const resolvedAllLabel = allLabel ?? `All ${label}`;

  const position = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.left });
  };

  useLayoutEffect(() => {
    if (isOpen) position();
  }, [isOpen]);

  // The trigger moves with the page, so keep the panel pinned to it.
  useEffect(() => {
    if (!isOpen) return;
    const onScrollOrResize = () => position();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }
    searchRef.current?.focus();

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const visible = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const select = (next: string) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          // The heading may itself be a sort trigger.
          e.stopPropagation();
          setIsOpen((o) => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1 -my-1 px-1.5 py-1 rounded text-xs font-semibold tracking-wide transition-colors hover:bg-gray-200/70 ${
          selected ? "text-blue-700" : "text-gray-700"
        }`}
      >
        <span className="truncate max-w-[10rem] normal-case">
          {selected ? selected.label : label}
        </span>
        {selected ? (
          <MdClose
            role="button"
            aria-label={`Clear ${label} filter`}
            className="w-3.5 h-3.5 shrink-0 text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        ) : (
          <MdExpandMore
            className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto py-1">
              <button
                type="button"
                onClick={() => select("")}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                  value ? "text-gray-700" : "bg-blue-50 text-blue-900 font-medium"
                }`}
              >
                {resolvedAllLabel}
              </button>

              {visible.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  No results found
                </div>
              ) : (
                visible.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => select(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                      value === option.value
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
