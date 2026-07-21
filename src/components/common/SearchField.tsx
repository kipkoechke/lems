"use client";

import { FaSearch } from "react-icons/fa";
import { MdClose } from "react-icons/md";

interface SearchFieldProps {
  /** The text currently in the box (not necessarily the applied term). */
  value: string;
  onChange: (value: string) => void;
  /** Applies the term. Fired by the button and by Enter. */
  onSearch?: () => void;
  /** Clears the box and resets the applied term. */
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Set false for purely decorative/local boxes that apply as you type. */
  showSearchButton?: boolean;
}

/**
 * Search input that applies on submit rather than on every keystroke, so
 * typing does not fire a request per letter.
 */
export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Search...",
  disabled = false,
  className = "",
  showSearchButton = true,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.();
    }
  };

  const withButton = showSearchButton && !!onSearch;
  const showClear = value.length > 0 && !!onClear;

  return (
    <div className={`relative flex-1 ${className}`}>
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full pl-10 ${
          withButton ? (showClear ? "pr-28" : "pr-24") : showClear ? "pr-10" : "pr-4"
        } py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-500 text-gray-900 text-sm`}
      />

      {showClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className={`absolute ${
            withButton ? "right-24" : "right-3"
          } top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
        >
          <MdClose className="w-4 h-4" />
        </button>
      )}

      {withButton && (
        <button
          type="button"
          onClick={onSearch}
          disabled={disabled}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSearch className="w-3 h-3" />
          Search
        </button>
      )}
    </div>
  );
};
