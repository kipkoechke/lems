import { ReactNode, useState } from "react";
import { FaSearch, FaTimes, FaFilter } from "react-icons/fa";

interface ResponsiveSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function ResponsiveSearch({
  searchValue,
  onSearchChange,
  placeholder = "Search...",
  filters,
  actions,
  className = "",
}: ResponsiveSearchProps) {
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={placeholder}
          />
          {searchValue && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {filters && (
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
                showFilters
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* Filters panel */}
      {filters && showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {filters}
        </div>
      )}
    </div>
  );
}

interface FilterGroupProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function FilterGroup({
  title,
  children,
  className = "",
}: FilterGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      {children}
    </div>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm bg-white ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
