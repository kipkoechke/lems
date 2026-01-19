import axios from "../lib/axios";

export interface Lot {
  id: string;
  number: string;
  name: string;
  is_active: boolean;
  services_count: number;
}

export interface LotDetail extends Lot {
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  lot_id: string;
  name: string;
  code: string;
  tariff: number;
  vendor_share: number;
  facility_share: number;
  capitated: boolean;
  is_active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface LotsResponse {
  data: Lot[];
  pagination: PaginationMeta;
}

export interface LotDetailResponse {
  data: LotDetail;
}

export interface LotServicesResponse {
  data: Service[];
  pagination: PaginationMeta;
}

export interface LotCreateRequest {
  number: string;
  name: string;
  is_active: boolean;
}

export interface LotUpdateRequest {
  number?: string;
  name?: string;
  is_active?: boolean;
}

export interface ServiceCreateRequest {
  name: string;
  code: string;
  tariff: number;
  vendor_share: number;
  facility_share: number;
  capitated: boolean;
}

export interface ServiceCreateResponse {
  message: string;
  service: Service;
}

export interface ServiceUpdateRequest {
  name?: string;
  code?: string;
  tariff?: number;
  vendor_share?: number;
  facility_share?: number;
  capitated?: boolean;
}

// Lot CRUD operations
export const getLots = async (page: number = 1): Promise<LotsResponse> => {
  const response = await axios.get<LotsResponse>(`/lots?page=${page}`);
  return response.data;
};

export const getLotById = async (id: string): Promise<LotDetail> => {
  const response = await axios.get<LotDetailResponse>(`/lots/${id}`);
  return response.data.data;
};

export const createLot = async (data: LotCreateRequest): Promise<Lot> => {
  const response = await axios.post<{ data: Lot }>("/lots", data);
  return response.data.data;
};

export const updateLot = async (
  id: string,
  data: LotUpdateRequest,
): Promise<LotDetail> => {
  const response = await axios.patch<LotDetailResponse>(`/lots/${id}`, data);
  return response.data.data;
};

export const deleteLot = async (id: string): Promise<void> => {
  await axios.delete(`/lots/${id}`);
};

// Service CRUD operations for a specific lot
export const getLotServices = async (
  lotId: string,
  page: number = 1,
): Promise<LotServicesResponse> => {
  const response = await axios.get<LotServicesResponse>(
    `/lots/${lotId}/services?page=${page}`,
  );
  return response.data;
};

export const createService = async (
  lotId: string,
  data: ServiceCreateRequest,
): Promise<Service> => {
  const response = await axios.post<ServiceCreateResponse>(
    `/lots/${lotId}/services`,
    data,
  );
  return response.data.service;
};

export const updateService = async (
  lotId: string,
  serviceId: string,
  data: ServiceUpdateRequest,
): Promise<Service> => {
  const response = await axios.patch<{ data: Service }>(
    `/lots/${lotId}/services/${serviceId}`,
    data,
  );
  return response.data.data;
};

export const deleteService = async (
  lotId: string,
  serviceId: string,
): Promise<void> => {
  await axios.delete(`/lots/${lotId}/services/${serviceId}`);
};
