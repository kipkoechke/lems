const SMALL_WORDS = new Set(["and", "of", "the", "for", "in"]);

/**
 * Facility and equipment names are stored in capitals; a page of them reads
 * as shouting. Codes in the name keep their case only if they hold a digit
 * ("FID123DX"), which a word never does.
 */
export const titleCase = (name: string): string =>
  name
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word, index) => {
      if (/\d/.test(word)) return word;
      const lower = word.toLowerCase();
      return index > 0 && SMALL_WORDS.has(lower)
        ? lower
        : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");

/** `KES 2,500`. Amounts arrive as strings ("2500.00") or numbers. */
export const kes = (value?: string | number | null): string =>
  `KES ${Math.round(Number(value) || 0).toLocaleString()}`;
