import axios from "../lib/axios";
import { NormalisedPagination, normalisePagination } from "./pagination";

export interface ServiceCategory {
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  contactInfo: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface EquipmentWithService {
  equipmentId: string;
  equipmentName: string;
  serialNumber?: string | null;
  status: string;
  vendorShare: string;
  facilityShare: string;
  capitated: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
  category: ServiceCategory;
  services: string;
}

// ============ Vendor Equipment Types & API ============

export interface EquipmentCategory {
  value: string;
  label: string;
}

export interface EquipmentStatus {
  value: string;
  label: string;
}

/**
 * Equipment testing history — the `worklist_tests` component carried by every
 * equipment detail payload (vendor, facility, vendor-scoped admin and admin).
 *
 * A probe worklist is pushed to the device and the study it sends back is
 * attached to the same accession. `succeeded` is therefore the figure that
 * matters: it is true exactly when the study came back, which is the only
 * proof the whole C-FIND → acquisition → C-STORE → callback chain works.
 * `results` holds the newest 20; the counters cover every test.
 */
export interface WorklistTestPerformer {
  id: string;
  code?: string;
  name?: string;
  ae_title?: string;
}

export interface WorklistTestResultRow {
  id: string;
  accession_number: string;
  worklist_status?: string | null;
  result_status?: string | null;
  succeeded: boolean;
  awaiting_result: boolean;
  result_received_at?: string | null;
  study_instance_uid?: string | null;
  study_date?: string | null;
  performed_by_ae_title?: string | null;
  performed_by?: WorklistTestPerformer | null;
  created_at?: string | null;
  sent_at?: string | null;
  completed_at?: string | null;
}

export interface WorklistTests {
  total: number;
  succeeded: number;
  awaiting_result: number;
  last_tested_at?: string | null;
  results: WorklistTestResultRow[];
}

export interface VendorEquipmentSpecifications {
  [key: string]: string | number | undefined;
}

export interface VendorEquipmentDicom {
  ae_title: string | null;
  hl7_host: string | null;
  hl7_port: number | null;
  dicom_port: number | null;
  is_connected: boolean;
  last_seen_at: string | null;
}

export interface VendorEquipmentVendorConfig {
  mwl_server_ip: string;
  mwl_server_port: number;
  mwl_server_aet: string;
  equipment_aet: string;
  connection_type: string;
}

export interface VendorEquipmentFacility {
  id: string;
  name: string;
  fr_code?: string;
}

export interface VendorEquipment {
  id: string;
  code: string;
  name: string;
  serial_number: string;
  model: string;
  brand: string;
  manufacture_date: string;
  category: string;
  category_label: string;
  modality: string | null;
  worklist_category: string | null;
  status:
    | "active"
    | "inactive"
    | "maintenance"
    | "decommissioned"
    | "pending_installation";
  status_label: string;
  description: string;
  specifications: VendorEquipmentSpecifications;
  dicom: VendorEquipmentDicom | null;
  vendor_config?: VendorEquipmentVendorConfig;
  // The vendor portal returns the connection fields flat on the equipment
  // (see vendor-portal-guide.md), not under `dicom`. Read them through
  // vendorEquipmentDicom() rather than either shape directly.
  ae_title?: string | null;
  host?: string | null;
  dicom_port?: number | null;
  /** Connected right now. */
  is_connected?: boolean;
  /** Ever seen on the network — a different question from `is_connected`. */
  linked?: boolean;
  last_seen_at?: string | null;
  connected_at?: string | null;
  facility?: VendorEquipmentFacility | null;
  worklist_tests?: WorklistTests | null;
}

/** Connection block for a vendor equipment row, flat or nested. */
export const vendorEquipmentDicom = (
  equipment: VendorEquipment,
): VendorEquipmentDicom | null => {
  if (equipment.dicom) return equipment.dicom;
  if (!equipment.ae_title && !equipment.host && !equipment.dicom_port) {
    return null;
  }
  return {
    ae_title: equipment.ae_title ?? null,
    hl7_host: equipment.host ?? null,
    hl7_port: null,
    dicom_port: equipment.dicom_port ?? null,
    is_connected: equipment.is_connected ?? false,
    last_seen_at: equipment.last_seen_at ?? null,
  };
};

/** Pagination in the shape the shared Pagination component expects. */
export type EquipmentPagination = NormalisedPagination;

/** Backwards-compatible alias. */
export type VendorEquipmentsPagination = NormalisedPagination;

export interface VendorEquipmentFilterOption {
  value: string;
  label: string;
}

export interface VendorEquipmentAvailableFilters {
  status?: VendorEquipmentFilterOption[];
  category?: VendorEquipmentFilterOption[];
  sort_by?: VendorEquipmentFilterOption[];
  sort_order?: VendorEquipmentFilterOption[];
}

interface VendorEquipmentsResponse {
  data: VendorEquipment[];
  pagination: EquipmentPagination;
  available_filters?: VendorEquipmentAvailableFilters;
}

export interface VendorEquipmentCreateRequest {
  name: string;
  category: string;
  serial_number?: string;
  model?: string;
  brand?: string;
  manufacture_date?: string;
  description?: string;
  specifications?: VendorEquipmentSpecifications;
  status?:
    | "active"
    | "inactive"
    | "maintenance"
    | "decommissioned"
    | "pending_installation";
  ae_title?: string;
  hl7_host?: string;
  hl7_port?: number;
  dicom_port?: number;
}

export interface VendorEquipmentCreateResponse {
  message: string;
  equipment: VendorEquipment;
  orthanc_registered?: boolean;
}

export interface VendorEquipmentsParams {
  page?: number;
  per_page?: number;
  status?: string;
  category?: string;
  search?: string;
  sort_by?: "name" | "code" | "status" | "created_at";
  sort_order?: "asc" | "desc";
}

// Get equipment categories
export const getEquipmentCategories = async (): Promise<
  EquipmentCategory[]
> => {
  const response = await axios.get("/equipments/categories");
  return response.data;
};

// Get equipment statuses
export const getEquipmentStatuses = async (): Promise<EquipmentStatus[]> => {
  const response = await axios.get("/equipments/statuses");
  return response.data;
};

// GET /vendor/equipments — vendor inferred from auth token
export const getVendorEquipments = async (
  _vendorId: string,
  params: VendorEquipmentsParams = {},
): Promise<VendorEquipmentsResponse> => {
  const response = await axios.get(`/vendor/equipments`, {
    params,
  });
  return {
    data: response.data?.data ?? [],
    // The vendor portal paginates under `meta` (vendor-portal-guide.md); older
    // deployments sent `pagination`. Reading only one of them silently loses
    // the page count and renders the list as a single page.
    pagination: normalisePagination(
      response.data?.meta ?? response.data?.pagination,
      params.per_page,
    ),
    available_filters: response.data?.available_filters,
  };
};

// GET /vendor/equipments/{id} — vendor inferred from auth token
export const getVendorEquipment = async (
  _vendorId: string,
  equipmentId: string,
): Promise<VendorEquipment> => {
  const response = await axios.get(`/vendor/equipments/${equipmentId}`);
  return response.data?.data ?? response.data;
};

/**
 * POST /vendors/{vendor}/equipments
 *
 * The read-only vendor portal (`/vendor/*`) has no create route — the API
 * reference exposes equipment writes through the vendor-scoped admin routes,
 * which a vendor may call for their own vendor.
 */
export const createVendorEquipment = async (
  vendorId: string,
  data: VendorEquipmentCreateRequest,
): Promise<VendorEquipment> => {
  const response = await axios.post(`/vendors/${vendorId}/equipments`, data);
  return response.data?.equipment ?? response.data?.data ?? response.data;
};

/** PATCH /vendors/{vendor}/equipments/{id} — see createVendorEquipment. */
export const updateVendorEquipment = async (
  vendorId: string,
  equipmentId: string,
  data: VendorEquipmentCreateRequest,
): Promise<VendorEquipment> => {
  const response = await axios.patch(
    `/vendors/${vendorId}/equipments/${equipmentId}`,
    data,
  );
  return response.data?.equipment ?? response.data?.data ?? response.data;
};

/**
 * DELETE /vendor/equipments/{id}
 *
 * Not documented in the API reference or the vendor portal guide, and no
 * vendor-scoped equivalent is published either. Unused by the UI — confirm the
 * route with the API team before wiring a delete action to it.
 */
export const deleteVendorEquipment = async (
  _vendorId: string,
  equipmentId: string,
): Promise<void> => {
  await axios.delete(`/vendor/equipments/${equipmentId}`);
};

// ============ Vendor Equipment DICOM (vendor portal) ============

export interface ConfigurationGuideField {
  label: string;
  value: string | number;
}

export interface ConfigurationGuideStep {
  step: number;
  label: string;
  field?: string;
  value?: string;
  note?: string;
  section?: string;
  fields?: ConfigurationGuideField[];
}

export interface ConfigurationGuide {
  title: string;
  steps: ConfigurationGuideStep[];
}

export interface VendorEquipmentDicomStatus {
  id?: string;
  name?: string;
  code?: string;
  ae_title: string | null;
  host?: string | null;
  ip?: string | null;
  hl7_host?: string | null;
  port?: number | null;
  dicom_port?: number | null;
  hl7_port?: number | null;
  is_connected: boolean;
  last_seen_at?: string | null;
  connected_at?: string | null;
  registered_in_orthanc?: boolean;
  orthanc_registered?: boolean;
  registered?: boolean;
  mwl_server?: VendorEquipmentVendorConfig | null;
  vendor_config?: VendorEquipmentVendorConfig | null;
  configuration_guide?: ConfigurationGuide | null;
}

export interface VendorDicomConfigureRequest {
  ae_title: string;
  ip: string;
  port: number;
}

export interface VendorDicomConfigureResponse {
  message?: string;
  ae_title?: string;
  ip?: string;
  port?: number;
  registered?: boolean;
}

export interface VendorDicomTestResponse {
  success?: boolean;
  is_connected?: boolean;
  connected?: boolean;
  message?: string;
}

export interface VendorWorklistTestResponse {
  success?: boolean;
  message?: string;
  /**
   * The probe is now registered in VEMS as well as Orthanc, so the study the
   * modality sends back attaches to this worklist instead of being rejected.
   */
  worklist_id?: string;
  accession_number?: string;
  [key: string]: unknown;
}

// GET /vendor/equipments/{id}/dicom-status
export const getVendorEquipmentDicomStatus = async (
  equipmentId: string,
): Promise<VendorEquipmentDicomStatus> => {
  const response = await axios.get(
    `/vendor/equipments/${equipmentId}/dicom-status`,
  );
  return response.data?.data ?? response.data;
};

// POST /vendor/equipments/{id}/configure — sets AE title/IP/port and registers
// the device in Orthanc.
export const configureVendorEquipmentDicom = async (
  equipmentId: string,
  data: VendorDicomConfigureRequest,
): Promise<VendorDicomConfigureResponse> => {
  const response = await axios.post(
    `/vendor/equipments/${equipmentId}/configure`,
    data,
  );
  return response.data?.data ?? response.data;
};

// POST /vendor/equipments/{id}/test-connection — C-ECHO, updates is_connected
export const testVendorEquipmentConnection = async (
  equipmentId: string,
): Promise<VendorDicomTestResponse> => {
  const response = await axios.post(
    `/vendor/equipments/${equipmentId}/test-connection`,
  );
  return response.data?.data ?? response.data;
};

// POST /vendor/worklist-test — creates a test worklist in Orthanc.
// `equipment_id` is required (vendor-portal-guide.md); the rest default
// server-side.
export const runVendorWorklistTest = async (
  equipmentId: string,
): Promise<VendorWorklistTestResponse> => {
  const response = await axios.post("/vendor/worklist-test", {
    equipment_id: equipmentId,
  });
  return response.data?.data ?? response.data;
};

// ============ Admin Equipment Types & API ============

export interface AdminEquipmentVendor {
  id: string;
  name: string;
  code: string;
}

export interface AdminEquipmentDicom {
  ae_title: string | null;
  hl7_host: string | null;
  hl7_port?: number | null;
  dicom_port: number | null;
  is_connected: boolean;
  last_seen_at?: string | null;
}

export interface AdminEquipment {
  id: string;
  code: string;
  name: string;
  serial_number: string;
  model: string;
  brand: string;
  manufacture_date?: string | null;
  category: string;
  category_label: string;
  modality: string | null;
  worklist_category?: string | null;
  status: string;
  status_label: string;
  vendor_id: string;
  vendor: AdminEquipmentVendor;
  owner_type: "vendor" | "facility";
  linked?: boolean;
  dicom: AdminEquipmentDicom | null;
  description?: string | null;
  specifications?: Record<string, unknown> | null;
  vendor_config?: VendorEquipmentVendorConfig | null;
  created_at: string;
  updated_at?: string;
}

export interface AdminEquipmentResponse {
  data: AdminEquipment[];
  pagination: EquipmentPagination;
  available_filters?: {
    modalities: { code: string; label: string }[];
  };
}

export interface AdminEquipmentParams {
  page?: number;
  per_page?: number;
  modality?: string;
  category?: string;
  status?: string;
  search?: string;
  vendor_id?: string;
  /** Owning facility. */
  facility_id?: string;
  /**
   * Ever seen on the network (`last_seen_at` set) — not the same as
   * `is_connected`, which is live state. Tri-state: omit for both.
   */
  linked?: boolean;
  sort_by?: string;
  sort_order?: string;
}

export const getAdminEquipments = async (
  params: AdminEquipmentParams = {},
): Promise<AdminEquipmentResponse> => {
  const response = await axios.get("/admin/equipment", {
    // `linked` is tri-state, so it is only sent when explicitly set.
    params: {
      ...params,
      linked: params.linked === undefined ? undefined : String(params.linked),
    },
  });
  return {
    data: response.data?.data ?? [],
    // This endpoint sends `total_pages`, not `last_page` — see the normaliser.
    pagination: normalisePagination(
      response.data?.pagination,
      params.per_page,
    ),
    available_filters: response.data?.available_filters,
  };
};

export interface EquipmentModalityCount {
  code: string;
  label: string;
  count: number;
}

export interface AdminEquipmentModalityBreakdown {
  total: number;
  counts: EquipmentModalityCount[];
  /** True when the tally stopped at the page cap and is therefore partial. */
  truncated: boolean;
}

/** Guard against an unbounded loop if the inventory ever grows very large. */
const MODALITY_TALLY_MAX_PAGES = 20;
const MODALITY_TALLY_PER_PAGE = 100;

/**
 * Modality breakdown for the equipment page's summary cards.
 *
 * `/admin/equipment` has no aggregate-count route, so this pages through the
 * listing and tallies client-side. `available_filters.modalities` supplies the
 * labels, and every known modality is returned — including the ones with no
 * equipment — so the cards read as a complete legend rather than a partial one.
 */
export const getAdminEquipmentModalityCounts = async (
  params: Pick<AdminEquipmentParams, "status" | "vendor_id" | "search"> = {},
): Promise<AdminEquipmentModalityBreakdown> => {
  const tally = new Map<string, number>();
  const labels = new Map<string, string>();
  let total = 0;
  let page = 1;
  let lastPage = 1;

  do {
    const response = await getAdminEquipments({
      ...params,
      page,
      per_page: MODALITY_TALLY_PER_PAGE,
    });

    response.available_filters?.modalities?.forEach((modality) => {
      labels.set(modality.code, modality.label);
      if (!tally.has(modality.code)) tally.set(modality.code, 0);
    });

    response.data.forEach((equipment) => {
      const code = equipment.modality || "unassigned";
      tally.set(code, (tally.get(code) ?? 0) + 1);
      total += 1;
    });

    lastPage = response.pagination.last_page;
    page += 1;
  } while (page <= lastPage && page <= MODALITY_TALLY_MAX_PAGES);

  const counts = Array.from(tally.entries())
    .map(([code, count]) => ({
      code,
      label: labels.get(code) ?? (code === "unassigned" ? "Unassigned" : code),
      count,
    }))
    // Deployed modalities first, then the empty ones alphabetically, so the
    // legend still names everything without burying the counts that matter.
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return { total, counts, truncated: lastPage > MODALITY_TALLY_MAX_PAGES };
};

/**
 * A single equipment item for the admin-facing detail page.
 *
 * This must NOT read /vendor/equipments/{id} — that route is gated to the
 * vendor role and 403s for admins. `/equipment/{id}` is the shared CRUD route.
 * Deployments differ on the returned shape (the admin list style with
 * `status_label`/`dicom`, versus the standalone style with
 * `operational_status`/`dicom_aet`), so the accessors below read either.
 */
export interface EquipmentDetail extends Partial<AdminEquipment> {
  id: string;
  name: string;
  description?: string | null;
  manufacture_date?: string | null;
  specifications?: Record<string, unknown> | null;
  vendor_config?: VendorEquipmentVendorConfig | null;

  // Standalone-shape fields.
  asset_id?: string;
  manufacturer?: string;
  operational_status?: string;
  lifecycle_state?: string;
  dicom_aet?: string | null;
  dicom_host?: string | null;
  dicom_port?: number | null;
  worklist_tests?: WorklistTests | null;

  // Flat-shape fields: `/equipment/{id}` returns the connection details on the
  // equipment itself (`ae_title`, `host`, `dicom_port`), not under `dicom`.
  ae_title?: string | null;
  host?: string | null;
  hl7_port?: number | null;
  is_connected?: boolean;
  linked?: boolean;
  last_seen_at?: string | null;
  connected_at?: string | null;
}

/** Machine-readable status, whichever field the deployment sends. */
export const equipmentStatus = (equipment: EquipmentDetail): string =>
  equipment.status ?? equipment.operational_status ?? equipment.lifecycle_state ?? "";

/** Human-readable status label, falling back to a de-slugged status. */
export const equipmentStatusLabel = (equipment: EquipmentDetail): string => {
  if (equipment.status_label) return equipment.status_label;
  const status = equipmentStatus(equipment);
  return status ? status.replace(/_/g, " ") : "-";
};

/** DICOM block, synthesised from the flat fields when not sent as an object. */
export const equipmentDicom = (
  equipment: EquipmentDetail,
): AdminEquipmentDicom | null => {
  if (equipment.dicom) return equipment.dicom;
  const aeTitle = equipment.dicom_aet ?? equipment.ae_title ?? null;
  const host = equipment.dicom_host ?? equipment.host ?? null;
  if (!aeTitle && !host && !equipment.dicom_port) {
    return null;
  }
  return {
    ae_title: aeTitle,
    hl7_host: host,
    hl7_port: equipment.hl7_port ?? null,
    dicom_port: equipment.dicom_port ?? null,
    is_connected: equipment.is_connected ?? false,
    last_seen_at: equipment.last_seen_at ?? null,
  };
};

/**
 * Admin-facing equipment update.
 *
 * Admins must NOT use PATCH /vendor/equipments/{id} — that route infers the
 * vendor from the auth token and is gated to the vendor role. The vendor-nested
 * admin route takes the vendor explicitly.
 */
// PATCH /vendors/{vendor}/equipments/{equipment}
export const updateAdminVendorEquipment = async (
  vendorId: string,
  equipmentId: string,
  data: Partial<VendorEquipmentCreateRequest>,
): Promise<VendorEquipment> => {
  const response = await axios.patch(
    `/vendors/${vendorId}/equipments/${equipmentId}`,
    data,
  );
  return response.data?.equipment ?? response.data?.data ?? response.data;
};

// GET /equipment/{id}
export const getEquipmentDetail = async (
  equipmentId: string,
): Promise<EquipmentDetail> => {
  const response = await axios.get<{ data: EquipmentDetail } | EquipmentDetail>(
    `/equipment/${equipmentId}`,
  );
  const body = response.data as { data?: EquipmentDetail };
  return body.data ?? (response.data as EquipmentDetail);
};

// ============================================================
// Standalone Equipment CRUD
// ============================================================

export interface StandaloneEquipment {
  id: string;
  asset_id?: string;
  name: string;
  category: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  model_version?: string;
  software_version?: string;
  department?: string;
  location?: string;
  country_of_origin?: string;
  worklist_ingestion_method?: string;
  transmission_method?: string;
  dicom_aet?: string;
  dicom_host?: string;
  dicom_port?: number;
  lifecycle_state: string;
  operational_status: string;
  facility_id?: string;
  vendor_id?: string;
  vendor?: {
    id: string;
    name: string;
    code: string;
  };
  last_maintenance?: string;
  next_maintenance?: string;
  maintenance_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StandaloneEquipmentListResponse {
  data: StandaloneEquipment[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface StandaloneEquipmentParams {
  facility_id?: string;
  facility_name?: string;
  lifecycle_state?: string;
  operational_status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface StandaloneEquipmentCreateRequest {
  vendor_id: string;
  name: string;
  category: string;
  facility_id: string;
  asset_id?: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  model_version?: string;
  software_version?: string;
  department?: string;
  location?: string;
  country_of_origin?: string;
  worklist_ingestion_method?: string;
  transmission_method?: string;
  dicom_aet?: string;
  dicom_host?: string;
  dicom_port?: number;
  lifecycle_state?: string;
  operational_status?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  maintenance_notes?: string;
}

// GET /equipment
export const getEquipments = async (
  params: StandaloneEquipmentParams = {},
): Promise<StandaloneEquipmentListResponse> => {
  const response = await axios.get("/equipment", { params });
  return response.data;
};

// POST /equipment
export const createEquipment = async (
  data: StandaloneEquipmentCreateRequest,
): Promise<StandaloneEquipment> => {
  const response = await axios.post<{ data: StandaloneEquipment }>(
    "/equipment",
    data,
  );
  return response.data.data ?? response.data;
};

// GET /equipment/{id}
export const getEquipment = async (
  equipmentId: string,
): Promise<StandaloneEquipment> => {
  const response = await axios.get<{ data: StandaloneEquipment }>(
    `/equipment/${equipmentId}`,
  );
  return response.data.data ?? response.data;
};

// PUT /equipment/{id}
export const updateEquipment = async (
  equipmentId: string,
  data: Partial<StandaloneEquipmentCreateRequest>,
): Promise<StandaloneEquipment> => {
  const response = await axios.put<{ data: StandaloneEquipment }>(
    `/equipment/${equipmentId}`,
    data,
  );
  return response.data.data ?? response.data;
};

// DELETE /equipment/{id}
export const deleteEquipment = async (equipmentId: string): Promise<void> => {
  await axios.delete(`/equipment/${equipmentId}`);
};

// ============================================================
// Equipment Capabilities & Procedures
// ============================================================

export interface EquipmentCapability {
  equipment_id: string;
  asset_id: string;
  name: string;
  facility_id: string;
  capable_procedures: string[];
  operational_status: string;
}

export interface EquipmentProcedure {
  id: string;
  procedure_id: string;
  sha_procedure_code: string;
  equipment_specific_code?: string;
  is_capable: boolean;
  processing_time_minutes?: number;
}

// GET /equipment/{id}/capabilities
export const getEquipmentCapabilities = async (
  equipmentId: string,
): Promise<EquipmentCapability> => {
  const response = await axios.get<EquipmentCapability>(
    `/equipment/${equipmentId}/capabilities`,
  );
  return response.data;
};

// GET /equipment/{id}/procedures
export const getEquipmentProcedures = async (
  equipmentId: string,
): Promise<EquipmentProcedure[]> => {
  const response = await axios.get<{ data: EquipmentProcedure[] }>(
    `/equipment/${equipmentId}/procedures`,
  );
  return response.data.data ?? response.data;
};

// POST /equipment/{id}/procedures
export const addEquipmentProcedure = async (
  equipmentId: string,
  data: {
    procedure_id: string;
    sha_procedure_code: string;
    equipment_specific_code?: string;
    is_capable?: boolean;
    processing_time_minutes?: number;
  },
): Promise<EquipmentProcedure> => {
  const response = await axios.post<{ data: EquipmentProcedure }>(
    `/equipment/${equipmentId}/procedures`,
    data,
  );
  return response.data.data ?? response.data;
};

// DELETE /equipment/{id}/procedures/{procedureId}
export const removeEquipmentProcedure = async (
  equipmentId: string,
  procedureId: string,
): Promise<void> => {
  await axios.delete(`/equipment/${equipmentId}/procedures/${procedureId}`);
};

/**
 * Operational equipment at one facility, by facility id.
 *
 * Superseded for facility accounts by the Facility Portal
 * (`/facility/equipments`, see apiFacilityEquipment.ts), which resolves the
 * facility from the token and returns vendor-mapped units too. This route
 * remains for admin/nesp/moh/cog, who query a facility they do not belong to.
 *
 * Deployments differ on how much of the equipment record they return here, so
 * the fields below are all optional and read through the accessors above where
 * a shared shape exists.
 */
export interface FacilityOperationalEquipment {
  equipment_id?: string;
  id?: string;
  asset_id?: string;
  code?: string;
  name: string;
  facility_id?: string;
  category?: string;
  category_label?: string;
  modality?: string | null;
  serial_number?: string;
  model?: string;
  brand?: string;
  manufacturer?: string;
  capable_procedures?: string[];
  operational_status?: string;
  status?: string;
  status_label?: string;
  vendor?: AdminEquipmentVendor | null;
}

/** Stable id for a facility equipment row, whichever key the API sends. */
export const facilityEquipmentId = (
  equipment: FacilityOperationalEquipment,
): string => equipment.equipment_id ?? equipment.id ?? equipment.asset_id ?? "";

/** Machine-readable status for a facility equipment row. */
export const facilityEquipmentStatus = (
  equipment: FacilityOperationalEquipment,
): string => equipment.operational_status ?? equipment.status ?? "";

// GET /equipment/facility/{facilityId}/operational
export const getFacilityOperationalEquipment = async (
  facilityId: string,
): Promise<FacilityOperationalEquipment[]> => {
  const response = await axios.get<
    { data: FacilityOperationalEquipment[] } | FacilityOperationalEquipment[]
  >(`/equipment/facility/${facilityId}/operational`);
  const body = response.data as { data?: FacilityOperationalEquipment[] };
  return body.data ?? (response.data as FacilityOperationalEquipment[]);
};

// POST /equipment/{id}/publish-orthanc
export const publishEquipmentToOrthanc = async (
  equipmentId: string,
): Promise<{ message: string }> => {
  const response = await axios.post(
    `/equipment/${equipmentId}/publish-orthanc`,
  );
  return response.data;
};

// POST /equipment/sync-dicom-aet
export const syncDicomAet = async (): Promise<void> => {
  await axios.post("/equipment/sync-dicom-aet");
};

// ============================================================
// Equipment Ping Requests
// ============================================================

export interface PingRequest {
  id: string;
  ae_title: string;
  ip_addr: string;
  port: number;
  request_type: string;
  modality?: string;
  device_name_ae_title?: string;
  machine_features?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  equipment_id?: string;
  status?: string;
  created_at?: string;
}

// POST /equipment/ping-requests
export const capturePingRequest = async (data: {
  ae_title: string;
  ip_addr: string;
  port: number;
  request_type?: string;
  modality?: string;
  device_name_ae_title?: string;
  machine_features?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  equipment_id?: string;
}): Promise<PingRequest> => {
  const response = await axios.post<{ data: PingRequest }>(
    "/equipment/ping-requests",
    data,
  );
  return response.data.data ?? response.data;
};

// GET /equipment/ping-requests/pending
export const getPendingPingRequests = async (): Promise<PingRequest[]> => {
  const response = await axios.get<{ data: PingRequest[] }>(
    "/equipment/ping-requests/pending",
  );
  return response.data.data ?? response.data;
};

// GET /equipment/ping-requests/realtime
export const getRealtimePingRequests = async (params?: {
  since?: string;
}): Promise<PingRequest[]> => {
  const response = await axios.get<{ data: PingRequest[] }>(
    "/equipment/ping-requests/realtime",
    { params },
  );
  return response.data.data ?? response.data;
};

// ============================================================
// DICOM Server & Modalities
// ============================================================

export interface DicomServerStatus {
  connected: boolean;
  orthanc_version: string;
  ae_title: string;
  host: string;
  port: number;
  registered_modalities: number;
}

export interface DicomModality {
  id: string;
  ae_title: string;
  host: string;
  port: number;
  is_connected?: boolean;
  last_seen_at?: string;
}

// GET /dicom/server/status
export const getDicomServerStatus = async (): Promise<DicomServerStatus> => {
  const response = await axios.get("/dicom/server/status");
  return response.data;
};

// GET /dicom/modalities
export const getDicomModalities = async (): Promise<DicomModality[]> => {
  const response = await axios.get<{ data: DicomModality[] }>(
    "/dicom/modalities",
  );
  return response.data.data ?? response.data;
};

// POST /dicom/modalities/register-all
export const registerAllModalities = async (): Promise<void> => {
  await axios.post("/dicom/modalities/register-all");
};

// ============================================================
// DICOM Equipment Operations
// ============================================================

export interface DicomConfigureRequest {
  ae_title: string;
  ip: string;
  port: number;
  vendor_id?: string;
}

export interface DicomConfigureResponse {
  message: string;
  equipment_id: string;
  ae_title: string;
  ip: string;
  port: number;
  registered: boolean;
}

export interface DicomEquipmentStatus {
  ae_title: string;
  is_connected: boolean;
  last_seen_at?: string;
}

// POST /vendor/equipments/{id}/configure
export const configureDicomEquipment = async (
  equipmentId: string,
  data: DicomConfigureRequest,
): Promise<DicomConfigureResponse> => {
  const response = await axios.post(
    `/vendor/equipments/${equipmentId}/configure`,
    data,
  );
  return response.data;
};

// POST /vendor/equipments/{id}/test-connection
export const testDicomConnection = async (
  equipmentId: string,
): Promise<{ message: string }> => {
  const response = await axios.post(
    `/vendor/equipments/${equipmentId}/test-connection`,
  );
  return response.data;
};

// POST /vendor/equipments/{id}/register
export const registerDicomModality = async (
  equipmentId: string,
): Promise<{ message: string }> => {
  const response = await axios.post(
    `/vendor/equipments/${equipmentId}/register`,
  );
  return response.data;
};

// DELETE /vendor/equipments/{id}/register
export const unregisterDicomModality = async (
  equipmentId: string,
): Promise<void> => {
  await axios.delete(`/vendor/equipments/${equipmentId}/register`);
};

// GET /vendor/equipments/{id}/dicom-status
export const getDicomEquipmentStatus = async (
  equipmentId: string,
): Promise<DicomEquipmentStatus> => {
  const response = await axios.get(
    `/vendor/equipments/${equipmentId}/dicom-status`,
  );
  return response.data;
};
