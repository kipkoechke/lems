/**
 * Utility functions for masking sensitive information
 */

/**
 * Mask phone number - mask 3 digits starting from position 6 (0-indexed)
 * Example: 254712345678 -> 254712***678
 * Example: 0712345678 -> 071234***8
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return "";

  const cleaned = phone.trim();
  if (cleaned.length <= 9) return cleaned;

  // Mask 3 digits starting from position 6 (characters at index 6, 7, 8)
  const firstPart = cleaned.slice(0, 6);
  const lastPart = cleaned.slice(9);

  return `${firstPart}***${lastPart}`;
};

/**
 * Mask email - show first 2 chars and domain
 * Example: francisokudongor@gmail.com -> fr***@gmail.com
 */
export const maskEmail = (email: string): string => {
  if (!email) return "";

  const parts = email.split("@");
  if (parts.length !== 2) return email;

  const [localPart, domain] = parts;
  if (localPart.length <= 2) return email;

  const maskedLocal = localPart.slice(0, 2) + "***";
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask ID number - show first 2 and last 2 digits
 * Example: 37949697 -> 37****97
 */
export const maskIdNumber = (id: string): string => {
  if (!id) return "";

  const cleaned = id.trim();
  if (cleaned.length <= 4) return cleaned;

  const firstPart = cleaned.slice(0, 2);
  const lastPart = cleaned.slice(-2);
  const maskedLength = cleaned.length - 4;

  return `${firstPart}${"*".repeat(maskedLength)}${lastPart}`;
};

/**
 * Mask SHA/CR/HH number - show prefix and last 3 digits
 * Example: SHA5560746396017-0 -> SHA***017-0
 */
export const maskReferenceNumber = (refNumber: string): string => {
  if (!refNumber) return "";

  const cleaned = refNumber.trim();

  // Extract prefix (SHA, CR, HH, etc.)
  const prefixMatch = cleaned.match(/^([A-Z]+)/);
  if (!prefixMatch) return cleaned;

  const prefix = prefixMatch[1];
  const restOfNumber = cleaned.slice(prefix.length);

  if (restOfNumber.length <= 5) return cleaned;

  // Keep last 5 characters (including any suffix like -0)
  const lastPart = restOfNumber.slice(-5);
  const maskedLength = Math.min(restOfNumber.length - 5, 5); // Limit asterisks

  return `${prefix}${"*".repeat(maskedLength)}${lastPart}`;
};

/**
 * Mask name - show first name and first letter of last name
 * Example: FRANCIS EKUDONGOR -> FRANCIS E.
 */
export const maskName = (name: string): string => {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name;

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0);

  return `${firstName} ${lastInitial}.`;
};

/**
 * Partially mask name - show full first name, mask middle, show last name initial
 * Example: OMAR MOHAMUD ABDULLAHI -> OMAR M. A.
 */
export const maskFullName = (name: string): string => {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name;
  if (parts.length === 2) return maskName(name);

  const firstName = parts[0];
  const middleInitials = parts
    .slice(1, -1)
    .map((part) => part.charAt(0) + ".")
    .join(" ");
  const lastInitial = parts[parts.length - 1].charAt(0) + ".";

  return `${firstName} ${middleInitials} ${lastInitial}`;
};
