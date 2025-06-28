import axios from "../lib/axios";

export interface Lot {
  id: string;
  number: string;
  name: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Service {
  id: string;
  lot_id: string;
  name: string;
  code: string;
  is_capitated: boolean;
  sha_rate: number;
  vendor_share: number;
  facility_share: number;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LotCreateRequest {
  number: string;
  name: string;
  is_active: boolean;
}

export interface LotUpdateRequest {
  id: string;
  number: string;
  name: string;
  is_active: boolean;
}

export interface ServiceCreateRequest {
  lot_id: string;
  name: string;
  code?: string;
  is_capitated: boolean;
  sha_rate: number;
  vendor_share: number;
  facility_share: number;
}

export interface ServiceUpdateRequest {
  id: string;
  lot_id: string;
  name: string;
  code?: string;
  is_capitated: boolean;
  sha_rate: number;
  vendor_share: number;
  facility_share: number;
}

export interface LotsResponse {
  lots: Lot[];
}

export interface ServicesResponse {
  services: Service[];
}

// Lot CRUD operations
export const getLots = async (): Promise<Lot[]> => {
  const response = await axios.get<LotsResponse>("/lots");
  return response.data.lots;
};

export const createLot = async (data: LotCreateRequest): Promise<Lot> => {
  const response = await axios.post<Lot>("/lots/upsert", data);
  return response.data;
};

export const updateLot = async (data: LotUpdateRequest): Promise<Lot> => {
  const response = await axios.post<Lot>("/lots/upsert", data);
  return response.data;
};

export const deleteLot = async (lotNumber: string): Promise<void> => {
  await axios.post("/lots/delete", { lot_number: lotNumber });
};

// Service CRUD operations
export const getServices = async (): Promise<Service[]> => {
  const response = await axios.get<ServicesResponse>("/services");
  return response.data.services;
};

export const createService = async (
  data: ServiceCreateRequest
): Promise<Service> => {
  const response = await axios.post<Service>("/services/upsert", data);
  return response.data;
};

export const updateService = async (
  data: ServiceUpdateRequest
): Promise<Service> => {
  const response = await axios.post<Service>("/services/upsert", data);
  return response.data;
};

export const deleteService = async (serviceCode: string): Promise<void> => {
  await axios.post("/services/delete", { service_code: serviceCode });
};
