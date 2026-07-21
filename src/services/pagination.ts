/**
 * Pagination normalisation.
 *
 * The API reports the page count as `total_pages` and omits `from`/`to`, while
 * the shared Pagination component reads `last_page`/`from`/`to`. Left
 * unnormalised, `last_page` is `undefined`, the usual `last_page > 1` guard is
 * false, and the pager silently disappears on multi-page lists.
 *
 * Normalise once here rather than teaching each page both shapes.
 */
export interface NormalisedPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface RawPagination {
  current_page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  last_page?: number;
  from?: number;
  to?: number;
}

export const normalisePagination = (
  raw?: RawPagination | null,
  fallbackPerPage = 15,
): NormalisedPagination => {
  const current_page = raw?.current_page ?? 1;
  const per_page = raw?.per_page ?? fallbackPerPage;
  const total = raw?.total ?? 0;
  const last_page = raw?.last_page ?? raw?.total_pages ?? 1;
  const from =
    raw?.from ?? (total === 0 ? 0 : (current_page - 1) * per_page + 1);
  const to = raw?.to ?? Math.min(current_page * per_page, total);

  return { current_page, last_page, per_page, total, from, to };
};
