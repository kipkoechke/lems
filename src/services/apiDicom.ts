import axios from "../lib/axios";

// ============================================================
// Types
// ============================================================

export interface DicomServerInfo {
  version: string;
  dicom_aet: string;
  dicom_port: number;
  server_ip: string;
  plugins_enabled: boolean;
  worklist_plugin_loaded: boolean;
  modalities_count: number;
}

export interface DicomServerStatus {
  connected: boolean;
  server: DicomServerInfo;
}

/**
 * A modality registered in Orthanc.
 *
 * The live endpoint returns the VEMS-enriched shape (`ae_title` plus nested
 * `equipment`/`network`/`vendor` blocks). Raw Orthanc returns a keyed object of
 * flat `{aet, host, port}` entries. Both are modelled here and read through the
 * accessors below — reading `name`/`aet`/`host`/`port` directly renders every
 * row as "-" against the live API.
 */
export interface DicomModality {
  // VEMS-enriched shape
  ae_title?: string;
  equipment?: {
    id?: string;
    code?: string;
    name?: string;
    category?: string;
    category_label?: string;
    modality?: string;
    status?: string;
    status_label?: string;
  } | null;
  network?: {
    ip?: string;
    port?: number;
  } | null;
  vendor?: {
    id?: string;
    name?: string;
    code?: string;
  } | null;
  facility?: {
    id?: string;
    name?: string;
    fr_code?: string;
  } | null;
  is_connected?: boolean;
  last_seen_at?: string | null;

  // Raw-Orthanc shape
  name?: string;
  aet?: string;
  host?: string;
  port?: number;
  manufacturer?: string;
  [key: string]: unknown;
}

/** Display name: the equipment it belongs to, else the raw Orthanc key. */
export const modalityName = (m: DicomModality): string =>
  m.equipment?.name || m.name || "-";

/** AE title, whichever shape the API returned. */
export const modalityAet = (m: DicomModality): string =>
  m.ae_title || m.aet || "-";

/** Host/IP, whichever shape the API returned. */
export const modalityHost = (m: DicomModality): string =>
  m.network?.ip || m.host || "-";

/** DICOM port, whichever shape the API returned. */
export const modalityPort = (m: DicomModality): string =>
  (m.network?.port ?? m.port)?.toString() ?? "-";

export interface DicomEquipmentStatus {
  equipment_id?: string;
  ae_title?: string | null;
  hl7_host?: string | null;
  hl7_port?: number | null;
  dicom_port?: number | null;
  is_connected?: boolean;
  last_seen_at?: string | null;
}

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

export interface DicomTestResult {
  success?: boolean;
  connected?: boolean;
  message?: string;
  [key: string]: unknown;
}

// ============================================================
// Server / modalities
// ============================================================

// GET /dicom/server/status
export const getDicomServerStatus = async (): Promise<DicomServerStatus> => {
  const response = await axios.get<DicomServerStatus | { data: DicomServerStatus }>(
    "/dicom/server/status",
  );
  const body = response.data as { data?: DicomServerStatus };
  return (body.data ?? response.data) as DicomServerStatus;
};

// GET /dicom/modalities — Orthanc returns a keyed object; normalise to an array.
export const getDicomModalities = async (): Promise<DicomModality[]> => {
  const response = await axios.get<
    DicomModality[] | Record<string, DicomModality> | { data: unknown }
  >("/dicom/modalities");

  const body = response.data as { data?: unknown };
  const raw = body.data ?? response.data;

  if (Array.isArray(raw)) return raw as DicomModality[];
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, DicomModality>).map(
      ([name, value]) => ({ name, ...(value ?? {}) }),
    );
  }
  return [];
};

// POST /dicom/modalities/register-all
export const registerAllModalities = async (): Promise<unknown> => {
  const response = await axios.post("/dicom/modalities/register-all");
  return response.data;
};

// ============================================================
// Per-equipment DICOM
// ============================================================

// POST /dicom/equipment/{id}/configure
export const configureEquipmentDicom = async (
  equipmentId: string,
  data: DicomConfigureRequest,
): Promise<DicomConfigureResponse> => {
  const response = await axios.post<DicomConfigureResponse>(
    `/dicom/equipment/${equipmentId}/configure`,
    data,
  );
  return response.data;
};

// POST /dicom/equipment/{id}/test — C-ECHO
export const testEquipmentDicom = async (
  equipmentId: string,
): Promise<DicomTestResult> => {
  const response = await axios.post<DicomTestResult>(
    `/dicom/equipment/${equipmentId}/test`,
  );
  return response.data;
};

// POST /dicom/equipment/{id}/register
export const registerEquipmentModality = async (
  equipmentId: string,
): Promise<unknown> => {
  const response = await axios.post(`/dicom/equipment/${equipmentId}/register`);
  return response.data;
};

// DELETE /dicom/equipment/{id}/register
export const unregisterEquipmentModality = async (
  equipmentId: string,
): Promise<void> => {
  await axios.delete(`/dicom/equipment/${equipmentId}/register`);
};

// GET /dicom/equipment/{id}/status
export const getEquipmentDicomStatus = async (
  equipmentId: string,
): Promise<DicomEquipmentStatus> => {
  const response = await axios.get<
    DicomEquipmentStatus | { data: DicomEquipmentStatus }
  >(`/dicom/equipment/${equipmentId}/status`);
  const body = response.data as { data?: DicomEquipmentStatus };
  return (body.data ?? response.data) as DicomEquipmentStatus;
};
