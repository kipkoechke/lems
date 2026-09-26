"use client";

import { SearchableSelect } from "./SearchableSelect";

/**
 * KEPH levels, as the API stores them.
 *
 * The value is the full label — the facility register holds "Level 4", not
 * "4" — and matching is case-insensitive, so sending the label back is safe.
 * A bare digit would match nothing.
 */
export const KEPH_LEVEL_FILTER_OPTIONS = [1, 2, 3, 4, 5, 6].map((level) => ({
  value: `Level ${level}`,
  label: `Level ${level}`,
}));

interface KephLevelFilterProps {
  value: string;
  onChange: (kephLevel: string) => void;
  /** The API's own list, when the endpoint publishes one. */
  options?: { value: string; label: string }[];
  label?: string;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}

/** KEPH level picker for list filters. */
export const KephLevelFilter: React.FC<KephLevelFilterProps> = ({
  value,
  onChange,
  options,
  label = "",
  placeholder = "All KEPH levels",
  compact = true,
  className = "w-full lg:w-44",
}) => (
  <SearchableSelect
    label={label}
    compact={compact}
    className={className}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    searchPlaceholder="Search levels..."
    options={options?.length ? options : KEPH_LEVEL_FILTER_OPTIONS}
  />
);
