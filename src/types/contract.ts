// Types matching the API response for /contracts?facility_id={id}

export interface ContractVendor {
  id: string;
  name: string;
  code: string;
}

export interface ContractFacility {
  id: string;
  name: string;
  code: string;
}

export interface ContractLot {
  id: string;
  number: string;
  name: string;
}

export interface ContractService {
  id: string;
  code: string;
  name: string;
  tariff: string;
}

export interface ContractEquipment {
  id: string;
  code: string;
  name: string;
  category: string;
  status: string;
  serial_number?: string;
}

export interface ContractServiceItem {
  id: string;
  lot: ContractLot;
  service: ContractService;
  equipment: ContractEquipment | null;
  is_active: boolean;
}

export interface FacilityContract {
  id: string;
  contract_number: string;
  vendor: ContractVendor;
  facility: ContractFacility;
  lot: ContractLot;
  lot_number: string;
  lot_name: string;
  start_date: string;
  end_date: string;
  status: "active" | "inactive" | "expired" | "pending";
  notes: string | null;
  created_by: string | null;
  created_at: string;
  services_count: number;
  services: ContractServiceItem[];
}

export interface FacilityContractsResponse {
  data: FacilityContract[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// Query params for fetching contracts
export interface FacilityContractsParams {
  facility_id: string;
  page?: number;
  per_page?: number;
  status?: string;
}

// Helper type for flattened service display (useful for components)
export interface FlattenedContractService {
  // From ContractServiceItem
  id: string;
  is_active: boolean;
  // Flattened from service
  service_id: string;
  service_code: string;
  service_name: string;
  sha_rate: string;
  // Flattened from lot
  lot_id: string;
  lot_number: string;
  lot_name: string;
  // Equipment (optional)
  equipment: ContractEquipment | null;
  // Parent contract info
  contract_id: string;
  vendor_name: string;
  facility_name: string;
}

// Helper function to flatten contract services
export const flattenContractServices = (
  contract: FacilityContract
): FlattenedContractService[] => {
  return contract.services.map((svc) => ({
    id: svc.id,
    is_active: svc.is_active,
    service_id: svc.service.id,
    service_code: svc.service.code,
    service_name: svc.service.name,
    sha_rate: svc.service.tariff,
    lot_id: svc.lot.id,
    lot_number: svc.lot.number,
    lot_name: svc.lot.name,
    equipment: svc.equipment,
    contract_id: contract.id,
    vendor_name: contract.vendor.name,
    facility_name: contract.facility.name,
  }));
};
