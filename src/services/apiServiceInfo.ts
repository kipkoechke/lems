import axios from "../lib/axios";

export interface ServiceInfo {
  serviceId: string;
  description: string;
  shaRate: number;
  vendorShare: number;
  facilityShare: number;
  categoryId: string;
}

export type ServiceInfoForm = Omit<ServiceInfo, "serviceId">;

export const createServiceInfo = async (
  data: ServiceInfoForm
): Promise<ServiceInfo> => {
  const response = await axios.post(`/create-service`, data);
  return response.data.data;
};

export const getServiceInfo = async (): Promise<ServiceInfo[]> => {
  const response = await axios.get(`/services`);
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
