import axios from "../lib/axios";

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
}

interface VendorEquipmentsResponse {
  data: VendorEquipment[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
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

// Get vendor equipments with pagination
export const getVendorEquipments = async (
  vendorId: string,
  params: VendorEquipmentsParams = {},
): Promise<VendorEquipmentsResponse> => {
  const response = await axios.get(`/vendors/${vendorId}/equipments`, {
    params,
  });
  return response.data;
};

// Get single vendor equipment
export const getVendorEquipment = async (
  vendorId: string,
  equipmentId: string,
): Promise<VendorEquipment> => {
  const response = await axios.get(
    `/vendors/${vendorId}/equipments/${equipmentId}`,
  );
  return response.data?.data ?? response.data;
};

// Create vendor equipment
export const createVendorEquipment = async (
  vendorId: string,
  data: VendorEquipmentCreateRequest,
): Promise<VendorEquipment> => {
  const response = await axios.post(`/vendors/${vendorId}/equipments`, data);
  return response.data?.equipment ?? response.data?.data ?? response.data;
};

// Update vendor equipment
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

// Delete vendor equipment
export const deleteVendorEquipment = async (
  vendorId: string,
  equipmentId: string,
): Promise<void> => {
  await axios.delete(`/vendors/${vendorId}/equipments/${equipmentId}`);
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
  category: string;
  category_label: string;
  modality: string | null;
  status: string;
  status_label: string;
  vendor_id: string;
  vendor: AdminEquipmentVendor;
  owner_type: "vendor" | "facility";
  dicom: AdminEquipmentDicom | null;
  created_at: string;
}

export interface AdminEquipmentResponse {
  data: AdminEquipment[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
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
  sort_by?: string;
  sort_order?: string;
}

export const getAdminEquipments = async (
  params: AdminEquipmentParams = {},
): Promise<AdminEquipmentResponse> => {
  const response = await axios.get("/admin/equipment", { params });
  return response.data;
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

// GET /equipment/facility/{facilityId}/operational
export const getFacilityOperationalEquipment = async (
  facilityId: string,
): Promise<EquipmentCapability[]> => {
  const response = await axios.get<{ data: EquipmentCapability[] }>(
    `/equipment/facility/${facilityId}/operational`,
  );
  return response.data.data ?? response.data;
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

// POST /dicom/equipment/{id}/configure
export const configureDicomEquipment = async (
  equipmentId: string,
  data: DicomConfigureRequest,
): Promise<DicomConfigureResponse> => {
  const response = await axios.post(
    `/dicom/equipment/${equipmentId}/configure`,
    data,
  );
  return response.data;
};

// POST /dicom/equipment/{id}/test
export const testDicomConnection = async (
  equipmentId: string,
): Promise<{ message: string }> => {
  const response = await axios.post(`/dicom/equipment/${equipmentId}/test`);
  return response.data;
};

// POST /dicom/equipment/{id}/register
export const registerDicomModality = async (
  equipmentId: string,
): Promise<{ message: string }> => {
  const response = await axios.post(
    `/dicom/equipment/${equipmentId}/register`,
  );
  return response.data;
};

// DELETE /dicom/equipment/{id}/register
export const unregisterDicomModality = async (
  equipmentId: string,
): Promise<void> => {
  await axios.delete(`/dicom/equipment/${equipmentId}/register`);
};

// GET /dicom/equipment/{id}/status
export const getDicomEquipmentStatus = async (
  equipmentId: string,
): Promise<DicomEquipmentStatus> => {
  const response = await axios.get(`/dicom/equipment/${equipmentId}/status`);
  return response.data;
};
