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
export const formatDateNairobi = (
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string => {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  return date.toLocaleString("en-KE", {
    ...options,
    timeZone: NAIROBI_TIMEZONE,
  });
};

/**
 * Format date for display in booking contexts (Nairobi timezone)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatBookingDate = (dateString: string): string => {
  return formatDateNairobi(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

/**
 * Format time only in Nairobi timezone
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export const formatTimeOnlyNairobi = (dateString: string): string => {
  return formatDateNairobi(dateString, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get current date/time in Nairobi timezone
 * @returns Date object adjusted to Nairobi timezone
 */
export const getNairobiDate = (): Date => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: NAIROBI_TIMEZONE })
  );
};

/**
 * Convert date to Nairobi timezone for datetime-local inputs
 * @param date - Date object
 * @returns ISO string in YYYY-MM-DDTHH:mm format for Nairobi timezone
 */
export const toNairobiDateTimeLocal = (date: Date = new Date()): string => {
  // Get the date in Nairobi timezone
  const nairobiDate = new Date(
    date.toLocaleString("en-US", { timeZone: NAIROBI_TIMEZONE })
  );

  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const year = nairobiDate.getFullYear();
  const month = String(nairobiDate.getMonth() + 1).padStart(2, "0");
  const day = String(nairobiDate.getDate()).padStart(2, "0");
  const hours = String(nairobiDate.getHours()).padStart(2, "0");
  const minutes = String(nairobiDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
