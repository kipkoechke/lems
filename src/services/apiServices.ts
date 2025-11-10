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

interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  status: string;
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
    sha_rate?: string;
    vendor_share?: string;
    facility_share?: string;
    is_capitated?: string;
    equipment?: Equipment | null;
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

  // Handle response structure: data array is in response.data.data
  const contracts = response.data?.data || [];
  console.log("📋 Contracts received:", contracts.length, contracts);

  // Services are now included in the contract response, no need for separate API calls
  const normalizedContracts = contracts.map((contract: any) => {
    // Get services from lot.services (they're now included in the response)
    // Using exact field names from API: lot.services[]
    const rawServices = contract.lot?.services || [];
    console.log(
      "✅ Services found:",
      rawServices.length,
      "for lot:",
      contract.lot?.name
    );

    // Normalize service structure to match component expectations
    // API returns: { id, name, code, sha_rate, vendor_share, facility_share, is_capitated, equipment }
    const normalizedServices = rawServices.map((service: any) => ({
      service_id: service.id,
      service_code: service.code,
      service_name: service.name,
      is_active: "1", // All services from API are active
      sha_rate: service.sha_rate,
      vendor_share: service.vendor_share,
      facility_share: service.facility_share,
      is_capitated: service.is_capitated,
      equipment: service.equipment
        ? {
            id: service.equipment.id,
            name: service.equipment.name,
            serial_number: service.equipment.serial_number,
            status: service.equipment.status,
          }
        : null,
    }));

    // Normalize contract structure
    // API structure: { id, vendor: {id, code, name}, facility: {id, code, name}, lot: {id, number, name, services}, is_active, created_at, updated_at }
    const normalized = {
      id: contract.id,
      vendor_code: contract.vendor?.code,
      vendor_name: contract.vendor?.name,
      vendor_id: contract.vendor?.id,
      facility_code: contract.facility?.code,
      facility_name: contract.facility?.name,
      facility_id: contract.facility?.id,
      lot_number: contract.lot?.number,
      lot_name: contract.lot?.name,
      lot_id: contract.lot?.id,
      is_active: contract.is_active,
      services: normalizedServices,
    } as FacilityContract;

    console.log("🎯 Normalized contract:", normalized);
    return normalized;
  });

  console.log(
    "✨ Final result:",
    normalizedContracts.length,
    "contracts with services",
    normalizedContracts
  );
  return normalizedContracts;
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
