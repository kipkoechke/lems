import axios from "../lib/axios";
import { ServiceCategory } from "./apiCategory";

export interface ServiceInfo {
  serviceId: string;
  serviceName: string;
  description: string;
  shaRate: number;
  vendorShare: number;
  facilityShare: number;
  id: string;
  capitated: number;
  category: any;
}

export interface ServiceWithCategory {
  serviceId: string;
  serviceName: string;
  description: string;
  shaRate: string;
  vendorShare: string;
  facilityShare: string;
  capitated: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
  category: ServiceCategory;
}

interface FacilityContract {
  id: string;
  vendor_code: string;
  vendor_name: string;
  facility_code: string;
  facility_name: string;
  lot_number: string;
  lot_name: string;
  is_active: string;
  services: Array<{
    service_id: string;
    service_code: string;
    service_name: string;
    is_active: string;
  }>;
}

export type ServiceInfoForm = Omit<ServiceInfo, "serviceId">;

export const createServiceInfo = async (
  data: ServiceInfoForm
): Promise<ServiceInfo> => {
  const response = await axios.post(`/create-service`, data);
  return response.data.data;
};

// New function to get services by facility code
export const getServicesByFacilityCode = async (
  facilityCode: string
): Promise<FacilityContract[]> => {
  const response = await axios.get(
    `contracts?facility_code=${facilityCode}`
  );
  return response.data;
};

export const getServiceInfo = async (): Promise<ServiceInfo[]> => {
  const response = await axios.get(`/lots`);
  return response.data.lots;
};

export const getServiceByCategory = async (
  id: string
): Promise<ServiceWithCategory[]> => {
  const response = await axios.get(`/category/services/${id}`);
  return response.data.data;
};

export const getServiceInfoById = async (
  serviceId: string
): Promise<ServiceInfo> => {
  const response = await axios.get(`/service/${serviceId}`);
  return response.data.data;
};

export const updateServiceInfo = async (
  serviceId: string,
  data: Partial<ServiceInfo>
): Promise<ServiceInfo> => {
  const response = await axios.patch(`/ServiceInfo/${serviceId}`, data);
  return response.data.data;
};

export const deleteServiceInfo = async (serviceId: string): Promise<void> => {
  await axios.delete<void>(`/ServiceInfo/${serviceId}`);
};
