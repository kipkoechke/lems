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
  vendor_id?: string;
  vendor_code?: string;
  vendor_name?: string;
  vendor?: {
    id: string;
    code: string;
    name: string;
  };
  facility_id?: string;
  facility_code?: string;
  facility_name?: string;
  facility?: {
    id: string;
    code: string;
    name: string;
  };
  lot_id?: string;
  lot_number?: string;
  lot_name?: string;
  lot?: {
    id: string;
    number: string;
    name: string;
  };
  is_active: string;
  services?: Array<{
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
  console.log("🔍 Fetching contracts for facility:", facilityCode);
  const response = await axios.get(`contracts?facility_code=${facilityCode}`);

  // Handle new response structure: data array is in response.data.data
  const contracts = response.data?.data || [];
  console.log("📋 Contracts received:", contracts.length, contracts);

  // Fetch services for each lot and normalize the data
  const contractsWithServices = await Promise.all(
    contracts.map(async (contract: any) => {
      try {
        // Fetch services for this lot
        const lotId = contract.lot?.id || contract.lot_id;
        if (!lotId) {
          console.warn("⚠️ Contract missing lot_id:", contract);
          return null;
        }

        console.log("🔍 Fetching services for lot:", lotId, contract.lot?.name);
        const lotResponse = await axios.get(`/lots/${lotId}`);
        console.log("📦 Lot response:", lotResponse.data);
        const rawServices = lotResponse.data.services || [];
        console.log(
          "✅ Services found:",
          rawServices.length,
          "for lot:",
          contract.lot?.name
        );

        // Normalize service structure to match component expectations
        const normalizedServices = rawServices.map((service: any) => ({
          service_id: service.id,
          service_code: service.code,
          service_name: service.name,
          is_active: service.is_active,
          vendor_share: service.vendor_share,
          facility_share: service.facility_share,
          description: service.description,
        }));

        // Normalize contract structure
        const normalized = {
          id: contract.id,
          vendor_code: contract.vendor?.code || contract.vendor_code,
          vendor_name: contract.vendor?.name || contract.vendor_name,
          facility_code: contract.facility?.code || contract.facility_code,
          facility_name: contract.facility?.name || contract.facility_name,
          lot_number: contract.lot?.number || contract.lot_number,
          lot_name: contract.lot?.name || contract.lot_name,
          is_active: contract.is_active,
          services: normalizedServices,
        } as FacilityContract;

        console.log("🎯 Normalized contract:", normalized);
        return normalized;
      } catch (error) {
        console.error(
          "❌ Error fetching services for contract:",
          contract.id,
          error
        );
        return null;
      }
    })
  );

  // Filter out any failed requests
  const result = contractsWithServices.filter(Boolean) as FacilityContract[];
  console.log(
    "✨ Final result:",
    result.length,
    "contracts with services",
    result
  );
  return result;
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
