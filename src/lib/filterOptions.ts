/**
 * Normalising the API's `available_filters` blocks.
 *
 * The API publishes two different shapes in the same block. Lists it composes
 * by hand — period, trend, activity type — arrive as `{value, label}`. Lists
 * it draws from a table — county, facility, vendor — arrive as the model's own
 * columns, `{id, name, code}` or `{id, name, fr_code}`. A select bound
 * straight to the second kind renders rows with no value and no text, which
 * reads as "No results found" rather than as a shape mismatch.
 *
 * A block can also arrive as neither: when the response is served from a
 * cache that could not rehydrate its Eloquent collections, each list comes
 * back as `{"__PHP_Incomplete_Class_Name": "..."}`. That is a backend fault
 * and nothing here can recover the options, but dropping the list leaves the
 * filter simply absent instead of present and broken.
 */

export interface NormalisedFilterOption {
  value: string;
  label: string;
  description?: string;
}

const optionFrom = (entry: unknown): NormalisedFilterOption | null => {
  if (!entry || typeof entry !== "object") return null;

  const row = entry as Record<string, unknown>;
  const value = row.value ?? row.id;
  const label = row.label ?? row.name;
  if (value == null || label == null) return null;

  const description = row.description ?? row.fr_code ?? row.code;

  return {
    value: String(value),
    label: String(label),
    ...(description == null ? {} : { description: String(description) }),
  };
};

/** One list. Anything that is not a usable array of options becomes `[]`. */
export const normaliseFilterOptions = (
  list: unknown,
): NormalisedFilterOption[] =>
  Array.isArray(list)
    ? list
        .map(optionFrom)
        .filter((option): option is NormalisedFilterOption => option !== null)
    : [];

/**
 * A whole `available_filters` block, key by key. Lists that normalise to
 * nothing are dropped, so `options?.length` checks still decide whether a
 * filter is offered at all.
 */
export const normaliseFilterBlock = <T>(block: unknown): T | undefined => {
  if (!block || typeof block !== "object") return undefined;

  const out: Record<string, NormalisedFilterOption[]> = {};
  for (const [key, list] of Object.entries(block as Record<string, unknown>)) {
    const options = normaliseFilterOptions(list);
    if (options.length) out[key] = options;
  }

  return out as T;
};
