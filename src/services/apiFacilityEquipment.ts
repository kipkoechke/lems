import axios from "../lib/axios";
import { normalisePagination, NormalisedPagination } from "./pagination";

/**
 * Facility Portal — Equipment (`/facility/equipments`).
 *
 * The facility is resolved from the authenticated user's profile: these routes
 * accept no facility identifier and never return another facility's equipment.
 * Two kinds of unit come back, distinguished by `ownership_type`:
 *
 * - `facility` — units the facility owns.
 * - `vendor`   — units a vendor has mapped to the facility through a contract
 *                service on an active, current contract.
 *
 * Listing and detail are open to every facility role; adding is `f_admin` only.
 */

export type FacilityEquipmentOwnership = "facility" | "vendor";

export interface FacilityEquipmentVendor {
  id: string;
  code?: string;
  name: string;
}

export interface FacilityEquipmentFacility {
  id: string;
  name: string;
  code?: string;
  fr_code?: string;
}

export interface MappedServiceLot {
  id: string;
  number: string;
  name: string;
}

/** A contract service this unit provides. */
export interface FacilityEquipmentMappedService {
  contract_service_id: string;
  contract_id: string;
  lot_service_id: string;
  code: string;
  name: string;
  tariff: string;
  is_active: boolean;
  lot?: MappedServiceLot | null;
}

export interface FacilityEquipmentListItem {
  id: string;
  ownership_type: FacilityEquipmentOwnership;
  code: string;
  name: string;
  serial_number?: string | null;
  model?: string | null;
  brand?: string | null;
  category?: string;
  category_label?: string;
  modality?: string | null;
  status: string;
  status_label?: string;
  status_color?: string;
  is_operational?: boolean;
  ae_title?: string | null;
  is_connected?: boolean;
  linked?: boolean;
  last_seen_at?: string | null;
  vendor?: FacilityEquipmentVendor | null;
  mapped_services_count?: number;
  mapped_services?: FacilityEquipmentMappedService[];
}

export interface FacilityEquipmentStatusHistoryEntry {
  id: string;
  status: string;
  started_at: string;
  ended_at?: string | null;
  downtime_minutes?: number | null;
  formatted_downtime?: string | null;
  reason?: string | null;
  notes?: string | null;
}

export interface FacilityEquipmentDicom {
  ae_title?: string | null;
  calling_ae_title?: string | null;
  host?: string | null;
  dicom_port?: number | null;
  hl7_port?: number | null;
  is_connected?: boolean;
  linked?: boolean;
  last_seen_at?: string | null;
  connected_at?: string | null;
}

export interface FacilityEquipmentActiveDowntime {
  id: string;
  started_at: string;
  reason?: string | null;
  notes?: string | null;
}

export interface FacilityEquipmentDetail extends FacilityEquipmentListItem {
  description?: string | null;
  specifications?: Record<string, unknown> | null;
  is_currently_down?: boolean;
  active_downtime?: FacilityEquipmentActiveDowntime | null;
  total_downtime_minutes?: number | null;
  dicom?: FacilityEquipmentDicom | null;
  facility?: FacilityEquipmentFacility | null;
  manufacture_date?: string | null;
  status_history?: FacilityEquipmentStatusHistoryEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface FacilityEquipmentSummary {
  total: number;
  /** Status counts, keyed by EquipmentStatus value (active, maintenance, …). */
  [status: string]: number;
}

export interface FacilityEquipmentFilterOption {
  value: string;
  label: string;
}

export interface FacilityEquipmentModalityOption {
  code: string;
  label: string;
}

export interface FacilityEquipmentAvailableFilters {
  status?: FacilityEquipmentFilterOption[];
  category?: FacilityEquipmentFilterOption[];
  modality?: FacilityEquipmentModalityOption[];
  ownership_type?: FacilityEquipmentFilterOption[];
  linked?: FacilityEquipmentFilterOption[];
  sort_by?: FacilityEquipmentFilterOption[];
  sort_order?: FacilityEquipmentFilterOption[];
}

export interface FacilityEquipmentParams {
  search?: string;
  modality?: string;
  category?: string;
  status?: string;
  /** Connected right now. */
  is_connected?: boolean;
  /**
   * Ever seen on the network. Tri-state: omit for both, `true` for ever-seen,
   * `false` for never-seen. Not the same question as `is_connected`.
   */
  linked?: boolean;
  ownership_type?: FacilityEquipmentOwnership;
  sort_by?:
    | "name"
    | "code"
    | "category"
    | "status"
    | "created_at"
    | "last_seen_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

export interface FacilityEquipmentsResponse {
  summary: FacilityEquipmentSummary;
  data: FacilityEquipmentListItem[];
  pagination: NormalisedPagination;
  available_filters?: FacilityEquipmentAvailableFilters;
}

// GET /facility/equipments
export const getFacilityEquipments = async (
  params: FacilityEquipmentParams = {},
): Promise<FacilityEquipmentsResponse> => {
  const response = await axios.get("/facility/equipments", {
    // `linked` is tri-state, so it is only sent when explicitly set; the API
    // wants the literal string.
    params: {
      ...params,
      linked: params.linked === undefined ? undefined : String(params.linked),
    },
  });

  // The summary and filter options moved under `meta`; earlier deployments
  // sent them at the top level.
  const body = response.data ?? {};
  const meta = body.meta ?? {};

  return {
    summary: meta.summary ?? body.summary ?? { total: 0 },
    data: body.data ?? [],
    // This endpoint sends `total_pages`, not `last_page` — see the normaliser.
    pagination: normalisePagination(
      body.pagination ?? meta.pagination,
      params.per_page ?? 20,
    ),
    available_filters: meta.available_filters ?? body.available_filters,
  };
};

// GET /facility/equipments/{id}
export const getFacilityEquipment = async (
  equipmentId: string,
): Promise<FacilityEquipmentDetail> => {
  const response = await axios.get<{ data?: FacilityEquipmentDetail }>(
    `/facility/equipments/${equipmentId}`,
  );
  return (
    response.data?.data ??
    (response.data as unknown as FacilityEquipmentDetail)
  );
};

/**
 * POST /facility/equipments — `f_admin` only.
 *
 * Registers a facility-owned unit by copying one already mapped to the
 * facility: the source is identified by any `contract_service_id` that unit
 * provides, and its name, model, brand, category and specifications are copied
 * across, along with the services it offers in the same lot.
 */
export interface FacilityEquipmentCreateRequest {
  contract_service_id: string;
  /** Max 64 chars; stored upper-cased. */
  ae_title: string;
  /** Defaults to the source unit's name. */
  name?: string;
  /** Must be unique; left null when omitted. */
  serial_number?: string;
}

export const createFacilityEquipment = async (
  data: FacilityEquipmentCreateRequest,
): Promise<FacilityEquipmentDetail> => {
  const response = await axios.post<{ data?: FacilityEquipmentDetail }>(
    "/facility/equipments",
    { ...data, ae_title: data.ae_title.toUpperCase() },
  );
  return (
    response.data?.data ??
    (response.data as unknown as FacilityEquipmentDetail)
  );
};

/** Status badge classes, driven by the API's own `status_color`. */
export const facilityEquipmentStatusClasses = (
  equipment: Pick<FacilityEquipmentListItem, "status" | "status_color">,
): string => {
  switch (equipment.status_color ?? equipment.status) {
    case "green":
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "yellow":
    case "maintenance":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "red":
    case "decommissioned":
      return "bg-red-50 text-red-700 border-red-200";
    case "blue":
    case "pending_installation":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
};
