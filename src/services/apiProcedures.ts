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

export interface Procedure {
  id: string;
  procedure_code: string;
  name: string;
  category?: string | null;
  procedure_type?: string | null;
  description?: string | null;
  reimbursement_amount: number | string;
  currency?: string;
  effective_from: string;
  effective_to?: string | null;
  lifecycle_state: ProcedureLifecycleState;
  created_at?: string;
  updated_at?: string;
}

export interface ProcedureListParams {
  lifecycle_state?: string;
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

export interface ProcedureCreateRequest {
  procedure_code: string;
  name: string;
  category?: string;
  procedure_type?: string;
  description?: string;
  reimbursement_amount: number;
  currency?: string;
  effective_from: string;
  effective_to?: string;
  lifecycle_state?: ProcedureLifecycleState;
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

// PUT /procedures/{id}
export const updateProcedure = async (
  procedureId: string,
  data: ProcedureUpdateRequest,
): Promise<Procedure> => {
  const response = await axios.put<{ data: Procedure }>(
    `/procedures/${procedureId}`,
    data,
  );
  return response.data.data ?? (response.data as unknown as Procedure);
};

// DELETE /procedures/{id} — soft-delete (marks retired), returns 204
export const deleteProcedure = async (procedureId: string): Promise<void> => {
  await axios.delete(`/procedures/${procedureId}`);
};
