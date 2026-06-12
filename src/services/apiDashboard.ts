import axios from "../lib/axios";

// ===== Dashboard Types =====

export interface EquipmentByOwner {
  vendor_owned: number;
  facility_owned: number;
}

export interface DashboardCounts {
  total_vendors: number;
  total_equipment: number;
  equipment_by_owner: EquipmentByOwner;
  total_facilities: number;
  completed_studies: number;
  active_worklists: number;
}

export interface ShaClaimPaid {
  count: number;
  amount: number;
  vendor_share: number;
  facility_share: number;
}

export interface ShaClaimStatusCount {
  count: number;
}

export interface ShaClaims {
  total_claims: number;
  paid: ShaClaimPaid;
  rejected: ShaClaimStatusCount;
  pending: ShaClaimStatusCount;
  bookings_by_status: Record<string, number>;
}

export interface ModalityCategory {
  category: string;
  label: string;
  count: number;
}

export interface ModalityBreakdown {
  modality: string;
  label: string;
  count: number;
  categories: ModalityCategory[];
}

export interface RecentActivityServiceStatus {
  completed: number;
  pending: number;
  cancelled: number;
}

export interface RecentActivity {
  id: string;
  booking_number: string;
  status: string;
  patient: {
    name: string;
    cr_no: string;
  };
  facility: {
    name: string;
    fr_code: string;
  };
  services_count: number;
  services_status: RecentActivityServiceStatus;
  created_at: string;
}

export interface DailyBreakdown {
  date: string;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface Efficiency {
  period_days: number;
  total_scheduled: number;
  total_completed: number;
  total_cancelled: number;
  completion_rate: number;
  daily_breakdown: DailyBreakdown[];
}

export interface DashboardResponse {
  counts: DashboardCounts;
  sha_claims: ShaClaims;
  modalities: ModalityBreakdown[];
  recent_activity: RecentActivity[];
  efficiency: Efficiency;
}

// ===== API Functions =====

export const getDashboard = async (): Promise<DashboardResponse> => {
  const response = await axios.get("/admin/dashboard");
  return response.data;
};
