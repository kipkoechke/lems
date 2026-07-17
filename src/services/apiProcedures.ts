import axios from "../lib/axios";

export type ProcedureLifecycleState = "active" | "suspended" | "retired";

export const PROCEDURE_LIFECYCLE_OPTIONS: {
  value: ProcedureLifecycleState;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "retired", label: "Retired" },
];

/**
 * A SHA procedure as the API actually returns it: a lot service priced with a
 * tariff and a vendor/facility revenue split.
 *
 * The reference documents an older shape (`procedure_code`,
 * `reimbursement_amount`, `effective_from`, `lifecycle_state`) that the live
 * endpoint does not send — reading those directly is what rendered every row as
 * "KES NaN" with empty columns. They are kept optional so the accessors below
 * can prefer whichever the deployment sends.
 */
export interface Procedure {
  id: string;
  lot_id?: string;
  name: string;
  code?: string;
  tariff?: number | string;
  vendor_share?: number | string;
  facility_share?: number | string;
  capitated?: boolean;
  is_active?: boolean;
  modality?: string | null;
  created_at?: string;
  updated_at?: string;

  // Legacy / documented fields — may be absent.
  procedure_code?: string;
  category?: string | null;
  procedure_type?: string | null;
  description?: string | null;
  reimbursement_amount?: number | string;
  currency?: string;
  effective_from?: string;
  effective_to?: string | null;
  lifecycle_state?: ProcedureLifecycleState;
}

/** Display code, whichever field the API populated. */
export const procedureCode = (procedure: Procedure): string =>
  procedure.code || procedure.procedure_code || "-";

/** The payable amount, preferring the live `tariff` field. */
export const procedureAmount = (
  procedure: Procedure,
): number | undefined => {
  const raw = procedure.tariff ?? procedure.reimbursement_amount;
  if (raw === null || raw === undefined || raw === "") return undefined;
  const amount = Number(raw);
  return Number.isNaN(amount) ? undefined : amount;
};

/** Whether a procedure is live, from either the boolean or the lifecycle field. */
export const isProcedureActive = (procedure: Procedure): boolean =>
  procedure.lifecycle_state
    ? procedure.lifecycle_state === "active"
    : procedure.is_active === true;

/** Human-readable state label matching the same precedence. */
export const procedureStateLabel = (procedure: Procedure): string =>
  procedure.lifecycle_state ?? (procedure.is_active ? "active" : "inactive");

export interface ProcedureListParams {
  lifecycle_state?: string;
  is_active?: boolean;
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface ProcedureListResponse {
  data: Procedure[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

/**
 * Mirrors the field names the read endpoint returns. The write contract is not
 * documented; these match what the API sends back for a procedure.
 */
export interface ProcedureCreateRequest {
  name: string;
  code: string;
  tariff: number;
  vendor_share?: number;
  facility_share?: number;
  modality?: string;
  capitated?: boolean;
  is_active?: boolean;
  lot_id?: string;
  description?: string;
}

export type ProcedureUpdateRequest = Partial<ProcedureCreateRequest>;

// GET /procedures — the endpoint may return a bare array or a paginated envelope.
export const getProcedures = async (
  params: ProcedureListParams = {},
): Promise<ProcedureListResponse> => {
  const response = await axios.get<ProcedureListResponse | Procedure[]>(
    "/procedures",
    { params },
  );

  if (Array.isArray(response.data)) {
    return { data: response.data };
  }

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

// GET /procedures/{id}
export const getProcedure = async (procedureId: string): Promise<Procedure> => {
  const response = await axios.get<{ data: Procedure }>(
    `/procedures/${procedureId}`,
  );
  return response.data.data ?? (response.data as unknown as Procedure);
};

// GET /procedures/active/list — simple list for dropdowns
export const getActiveProcedures = async (): Promise<Procedure[]> => {
  const response = await axios.get<{ data: Procedure[] } | Procedure[]>(
    "/procedures/active/list",
  );
  return Array.isArray(response.data)
    ? response.data
    : (response.data.data ?? []);
};

// POST /procedures
export const createProcedure = async (
  data: ProcedureCreateRequest,
): Promise<Procedure> => {
  const response = await axios.post<{ data: Procedure }>("/procedures", data);
  return response.data.data ?? (response.data as unknown as Procedure);
};

// PATCH /procedures/{id} — the API accepts PUT and PATCH; PATCH matches the
// partial-update semantics of this form (only changed fields are sent).
export const updateProcedure = async (
  procedureId: string,
  data: ProcedureUpdateRequest,
): Promise<Procedure> => {
  const response = await axios.patch<{ data: Procedure }>(
    `/procedures/${procedureId}`,
    data,
  );
  return response.data.data ?? (response.data as unknown as Procedure);
};

// DELETE /procedures/{id} — soft-delete (marks retired), returns 204
export const deleteProcedure = async (procedureId: string): Promise<void> => {
  await axios.delete(`/procedures/${procedureId}`);
};
