import axios from "../lib/axios";
import type { EquipmentConnectivity } from "./apiConnectivity";

/**
 * Facility Portal — dashboard (`GET /facility/dashboard`).
 *
 * The facility is resolved from the signed-in user's profile, so nothing is
 * passed. It counts the same equipment population as the facility equipment
 * listing: units the facility owns plus the vendor units mapped to it through
 * an active contract service.
 *
 * Open to every facility role, which is why this exists at all — facility
 * accounts get a 403 from `/admin/dashboard`.
 */

export interface FacilityDashboardFacility {
  id: string;
  name: string;
  fr_code?: string;
}

export interface FacilityDashboardEquipment {
  total: number;
  /** Always carries every status, including the empty ones. */
  by_status: Record<string, number>;
  by_connectivity?: EquipmentConnectivity;
}

export interface FacilityDashboardStudies {
  total: number;
  /** `pending`, `sent` or `in_progress`. */
  active: number;
  completed: number;
  cancelled: number;
  with_result: number;
  awaiting_result: number;
  /**
   * Minutes from the worklist being published to the result arriving. Null
   * until at least one study has completed the round trip.
   */
  average_turnaround_minutes?: number | null;
}

export interface FacilityDashboardServices {
  total: number;
  completed: number;
  not_started: number;
  cancelled: number;
  /** completed ÷ (total − cancelled), so abandoned bookings do not drag it down. */
  completion_rate: number;
}

export interface FacilityDashboardRevenue {
  tariff: string;
  facility_share: string;
  vendor_share: string;
}

export interface FacilityDashboardBookings {
  total: number;
  this_month: number;
  by_status: Record<string, number>;
  /** Distinct patients. */
  patients: number;
}

export interface FacilityDashboardResponse {
  facility?: FacilityDashboardFacility;
  equipment: FacilityDashboardEquipment;
  studies: FacilityDashboardStudies;
  services: FacilityDashboardServices;
  revenue: FacilityDashboardRevenue;
  bookings: FacilityDashboardBookings;
  /** Studies that arrived on this facility's machines with no order. */
  unmatched_studies?: number;
}

// GET /facility/dashboard
export const getFacilityDashboard =
  async (): Promise<FacilityDashboardResponse> => {
    const response = await axios.get<{ data?: FacilityDashboardResponse }>(
      "/facility/dashboard",
    );
    return (
      response.data?.data ??
      (response.data as unknown as FacilityDashboardResponse)
    );
  };
