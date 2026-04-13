import type {
  FacilityContract,
  FacilityContractsResponse,
} from "@/types/contract";
import axios from "../lib/axios";
import { ServiceCategory } from "./apiCategory";

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

// Get contracts/services by facility ID
export const getServicesByFacilityId = async (
  facilityId: string,
): Promise<FacilityContract[]> => {
  const response = await axios.get<FacilityContractsResponse>(
    `contracts?facility_id=${facilityId}`,
  );
  return response.data.data;
};
