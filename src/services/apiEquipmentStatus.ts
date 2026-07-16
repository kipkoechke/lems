import axios from "../lib/axios";

export interface EquipmentStatusLog {
  id: string;
  equipment_id: string;
  equipment?: {
    id: string;
    code?: string;
    name?: string;
  } | null;
  status: string;
  status_label?: string;
  notes?: string | null;
  created_at?: string;
  created_by?: { id: string; name: string } | null;
}

export interface EquipmentStatusSummary {
  total_equipment: number;
  operational: number;
  maintenance: number;
  non_operational: number;
  unknown: number;
  total_downtime_hours: number;
  average_mtbf_hours: number;
}

export interface EquipmentStatusListParams {
  equipment_id?: string;
  status?: string;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

export interface EquipmentStatusListResponse {
  data: EquipmentStatusLog[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface EquipmentStatusCreateRequest {
  equipment_id: string;
  status: string;
  notes?: string;
}

// GET /equipment-status
export const getEquipmentStatusLogs = async (
  params: EquipmentStatusListParams = {},
): Promise<EquipmentStatusListResponse> => {
  const response = await axios.get<EquipmentStatusListResponse>(
    "/equipment-status",
    { params },
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};

// POST /equipment-status — log a status change
export const createEquipmentStatusLog = async (
  data: EquipmentStatusCreateRequest,
): Promise<EquipmentStatusLog> => {
  const response = await axios.post<{ data: EquipmentStatusLog }>(
    "/equipment-status",
    data,
  );
  return response.data.data ?? (response.data as unknown as EquipmentStatusLog);
};

// GET /equipment-status/summary
export const getEquipmentStatusSummary =
  async (): Promise<EquipmentStatusSummary> => {
    const response = await axios.get<
      { data: EquipmentStatusSummary } | EquipmentStatusSummary
    >("/equipment-status/summary");
    const body = response.data as { data?: EquipmentStatusSummary };
    return (body.data ?? response.data) as EquipmentStatusSummary;
  };

// GET /equipment-status/active-downtimes
export const getActiveDowntimes = async (): Promise<EquipmentStatusLog[]> => {
  const response = await axios.get<
    { data: EquipmentStatusLog[] } | EquipmentStatusLog[]
  >("/equipment-status/active-downtimes");
  return Array.isArray(response.data)
    ? response.data
    : (response.data.data ?? []);
};
