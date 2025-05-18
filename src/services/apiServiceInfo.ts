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
  const response = await axios.post<ServiceInfo>(`/ServiceInfo`, data);
  return response.data;
};

export const getServiceInfo = async (): Promise<ServiceInfo[]> => {
  const response = await axios.get<ServiceInfo[]>(`/ServiceInfo`);
  return response.data;
};

export const getServiceInfoById = async (
  serviceId: string
): Promise<ServiceInfo> => {
  const response = await axios.get<ServiceInfo>(`/ServiceInfo/${serviceId}`);
  return response.data;
};

export const updateServiceInfo = async (
  serviceId: string,
  data: Partial<ServiceInfo>
): Promise<ServiceInfo> => {
  const response = await axios.patch<ServiceInfo>(
    `/ServiceInfo/${serviceId}`,
    data
  );
  return response.data;
};

export const deleteServiceInfo = async (serviceId: string): Promise<void> => {
  await axios.delete<void>(`/ServiceInfo/${serviceId}`);
};
