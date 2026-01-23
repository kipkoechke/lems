// Types for practitioner worklist endpoint
// GET /practitioner/worklist

import { Pagination } from "./pagination";

export interface WorklistPatient {
  id: string;
  name: string;
  phone: string;
  identification_no: string;
}

export interface WorklistFacility {
  id: string;
  name: string;
  fr_code: string;
}

export interface WorklistPayment {
  tariff: string;
  sha: string;
  cash: string;
  other_insurance: string;
}

export interface WorklistServiceLot {
  number: string;
  name: string;
}

export interface WorklistServiceInfo {
  code: string;
  name: string;
}

export interface WorklistServiceEquipment {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface WorklistServicePractitioner {
  id: string;
  name: string;
}

export interface WorklistService {
  id: string;
  lot: WorklistServiceLot;
  service: WorklistServiceInfo;
  equipment: WorklistServiceEquipment | null;
  practitioner: WorklistServicePractitioner | null;
  scheduled_date: string;
  status: "not_started" | "in_progress" | "completed" | "cancelled";
  tariff: string;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface WorklistCreatedBy {
  id: string;
  name: string;
}

export interface WorklistBooking {
  id: string;
  booking_number: string;
  status: "pending_otp" | "active" | "completed" | "cancelled";
  source: "standalone" | "hmis" | "provider_portal";
  patient: WorklistPatient;
  facility: WorklistFacility;
  payment: WorklistPayment;
  services: WorklistService[];
  services_count: number;
  pending_count: number;
  completed_count: number;
  created_by: WorklistCreatedBy;
  created_at: string;
}

export interface WorklistSummary {
  total_bookings: number;
  unique_patients: number;
  total_tariff: string;
  today: number;
  by_status: {
    pending_otp: number;
    active: number;
    completed: number;
    cancelled: number;
  };
}

export interface WorklistResponse {
  data: WorklistBooking[];
  summary: WorklistSummary;
  pagination: Pagination;
}

export interface WorklistParams {
  page?: number;
  per_page?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}
