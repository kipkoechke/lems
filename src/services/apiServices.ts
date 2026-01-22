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
  code?: string;
  name: string;
  serial_number?: string;
  category?: string;
  status: string;
}

interface FacilityContract {
  id: string;
  contract_number?: string;
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
  start_date?: string;
  end_date?: string;
  status?: string;
  notes?: string;
  is_active: string;
  services_count?: number;
  services?: Array<{
    service_id: string;
    service_code: string;
    service_name: string;
    is_active: string;
    sha_rate?: string;
    vendor_share?: string;
    facility_share?: string;
    is_capitated?: string;
    lot_id?: string;
    lot_number?: string;
    lot_name?: string;
    equipment?: Equipment | null;
  }>;
}

export type ServiceInfoForm = Omit<ServiceInfo, "serviceId">;

export const createServiceInfo = async (
  data: ServiceInfoForm,
): Promise<ServiceInfo> => {
  const response = await axios.post(`/create-service`, data);
  return response.data.data;
};

// New function to get services by facility ID
export const getServicesByFacilityId = async (
  facilityId: string,
): Promise<FacilityContract[]> => {
  console.log("🔍 Fetching contracts for facility:", facilityId);
  const response = await axios.get(`contracts?facility_id=${facilityId}`);

  // Handle response structure: data array is in response.data.data
  const contracts = response.data?.data || [];
  console.log("📋 Contracts received:", contracts.length, contracts);

  // Services are now at contract level with nested lot/service objects
  // New API structure: contract.services[] where each has { id, lot, service, equipment, is_active }
  const normalizedContracts = contracts.map((contract: any) => {
    const rawServices = contract.services || [];
    console.log(
      "✅ Services found:",
      rawServices.length,
      "for contract:",
      contract.contract_number,
    );

    // Normalize service structure to match component expectations
    // New API returns: { id, lot: {id, number, name}, service: {id, code, name, tariff}, equipment: {...}, is_active }
    const normalizedServices = rawServices.map((svc: any) => ({
      service_id: svc.service?.id || svc.id,
      service_code: svc.service?.code,
      service_name: svc.service?.name,
      is_active: svc.is_active ? "1" : "0",
      sha_rate: svc.service?.tariff,
      vendor_share: svc.vendor_share,
      facility_share: svc.facility_share,
      is_capitated: svc.is_capitated,
      lot_id: svc.lot?.id,
      lot_number: svc.lot?.number,
      lot_name: svc.lot?.name,
      equipment: svc.equipment
        ? {
            id: svc.equipment.id,
            code: svc.equipment.code,
            name: svc.equipment.name,
            category: svc.equipment.category,
            status: svc.equipment.status,
          }
        : null,
    }));

    // Normalize contract structure
    // New API structure: { id, contract_number, vendor, facility, start_date, end_date, status, notes, services_count, services }
    const normalized = {
      id: contract.id,
      contract_number: contract.contract_number,
      vendor_code: contract.vendor?.code,
      vendor_name: contract.vendor?.name,
      vendor_id: contract.vendor?.id,
      facility_code: contract.facility?.code,
      facility_name: contract.facility?.name,
      facility_id: contract.facility?.id,
      start_date: contract.start_date,
      end_date: contract.end_date,
      status: contract.status,
      notes: contract.notes,
      is_active: contract.status === "active" ? "1" : "0",
      services_count: contract.services_count,
      services: normalizedServices,
      // Also include first lot info for backward compatibility
      lot_id: rawServices[0]?.lot?.id,
      lot_number: rawServices[0]?.lot?.number,
      lot_name: rawServices[0]?.lot?.name,
    } as FacilityContract;

    console.log("🎯 Normalized contract:", normalized);
    return normalized;
  });

  console.log(
    "✨ Final result:",
    normalizedContracts.length,
    "contracts with services",
    normalizedContracts,
  );
  return normalizedContracts;
};

export const getServiceInfo = async (): Promise<ServiceInfo[]> => {
  const response = await axios.get(`/lots`);
  return response.data.lots;
};

export const getServiceByCategory = async (
  id: string,
): Promise<ServiceWithCategory[]> => {
  const response = await axios.get(`/category/services/${id}`);
  return response.data.data;
};

export const getServiceInfoById = async (
  serviceId: string,
): Promise<ServiceInfo> => {
  const response = await axios.get(`/service/${serviceId}`);
  return response.data.data;
};

export const updateServiceInfo = async (
  serviceId: string,
  data: Partial<ServiceInfo>,
): Promise<ServiceInfo> => {
  const response = await axios.patch(`/ServiceInfo/${serviceId}`, data);
  return response.data.data;
};

export const deleteServiceInfo = async (serviceId: string): Promise<void> => {
  await axios.delete<void>(`/ServiceInfo/${serviceId}`);
};
