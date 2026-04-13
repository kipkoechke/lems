/**
 * Date utility functions for handling Africa/Nairobi timezone
 */

const NAIROBI_TIMEZONE = "Africa/Nairobi";

/**
 * Format date string to Africa/Nairobi timezone
 * @param dateString - ISO date string or date-like string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Nairobi timezone
 */
const formatDateNairobi = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  return date.toLocaleString("en-KE", {
    ...options,
    timeZone: NAIROBI_TIMEZONE,
  });
};

/**
 * Format date only (no time) in Nairobi timezone
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDateOnlyNairobi = (dateString: string): string => {
  return formatDateNairobi(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
