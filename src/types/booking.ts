// Types matching the API response for booking endpoints

// ===== Initiate Booking =====
// POST /bookings/initiate

export interface InitiateBookingPayload {
  facility_id: string;
  patient_id: string;
  override: boolean;
  notes?: string;
  services: {
    contract_service_id: string;
    practitioner_id?: string;
    scheduled_date: string;
    notes?: string;
  }[];
}

export interface OtpRecipient {
  type: "patient" | "facility";
  name: string;
}

export interface InitiateBookingData {
  session_id: string;
  phone: string;
  expires_at: string;
  is_override: boolean;
  otp_recipient: OtpRecipient;
  patient: {
    id: string;
    name: string;
  };
  facility: {
    id: string;
    name: string;
  };
  services_count: number;
}

export interface InitiateBookingResponse {
  message: string;
  data: InitiateBookingData;
}

// ===== Verify OTP =====
// POST /bookings/verify-otp

export interface VerifyOtpPayload {
  session_id: string;
  otp: string;
}

export interface BookingPatient {
  id: string;
  name: string;
  phone: string;
  identification_no: string;
  identification_type?: string;
  sha_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

export interface BookingFacility {
  id: string;
  name: string;
  fr_code: string;
  code?: string;
  keph_level?: string;
}

export interface BookingPayment {
  tariff: string;
  cash: string;
  other_insurance: string;
  sha: string;
}

export interface BookingServiceLot {
  number: string;
  name: string;
}

export interface BookingServiceInfo {
  code: string;
  name: string;
  sha_rate?: string;
}

export interface BookingServiceEquipment {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

export interface BookingServicePractitioner {
  id: string;
  name: string;
}

export interface BookingServiceRevenue {
  vendor_share: string;
  facility_share: string;
}

// Flat structure for booked_services from patient bookings API
export interface BookedService {
  id: string;
  name: string;
  code: string;
  scheduled_date: string;
  status: "not_started" | "in_progress" | "completed" | "cancelled";
  tariff: string;
  sha: string;
  cash: string;
  other_insurance: string;
  vendor_share: string;
  facility_share: string;
  started_at: string | null;
  completed_at: string | null;
  equipment: BookingServiceEquipment | null;
  practitioner: BookingServicePractitioner | null;
  notes: string | null;
}

// Nested structure for services from verify-otp API
export interface BookingService {
  id: string;
  lot?: BookingServiceLot;
  service?: BookingServiceInfo;
  name?: string;
  code?: string;
  scheduled_date: string;
  booking_date?: string;
  tariff: string;
  sha?: string;
  cash?: string;
  other_insurance?: string;
  payment?: BookingPayment;
  revenue?: BookingServiceRevenue;
  vendor_share?: string;
  facility_share?: string;
  equipment: BookingServiceEquipment | null;
  practitioner: BookingServicePractitioner | null;
  status: "not_started" | "in_progress" | "completed" | "cancelled";
  service_status?: string;
  cancel_reason?: string | null;
  notes: string | null;
  equipment_assigned_at?: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  booking_number: string;
  patient: BookingPatient;
  facility: BookingFacility;
  source?: "standalone" | "dha" | "hmis" | "provider_portal";
  status: "active" | "pending" | "pending_otp" | "completed" | "cancelled";
  booking_status?: string;
  approval_status?: string;
  override?: boolean;
  payment?: BookingPayment;
  payment_mode?: string;
  booking_date?: string;
  // Payment fields from list API (flat structure)
  services_count: number;
  pending_count: number;
  completed_count: number;
  tariff: string;
  sha: string;
  cash: string;
  other_insurance?: string;
  eligibility_verified?: boolean | string | null;
  eligibility_response?: string | null;
  finance_approved_at?: string | null;
  notes?: string | null;
  // Different APIs return different structures
  services: BookingService[];
  booked_services: BookedService[];
  created_by: string | null;
  created_at: string;
  updated_at?: string;
}

export interface VerifyOtpResponse {
  message: string;
  data: Booking;
}

// ===== Resend OTP =====
// POST /bookings/resend-otp

export interface ResendOtpPayload {
  session_id: string;
}

export interface ResendOtpResponse {
  message: string;
  data: {
    session_id: string;
    phone: string;
    expires_at: string;
  };
}

// ===== Get Bookings =====

export interface BookingsSummary {
  total_bookings: number;
  unique_patients: number;
  by_status: {
    pending_otp: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  by_source: {
    standalone: number;
    hmis: number;
    provider_portal: number;
  };
  revenue: {
    tariff: string;
    sha: string;
    cash: string;
    other_insurance: string;
  };
}

export interface BookingsResponse {
  data: Booking[];
  summary?: BookingsSummary;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface BookingFilters {
  vendor_id?: string;
  facility_id?: string;
  status?: string;
  booking_status?: string;
  approval_status?: string;
  service_completion?: string;
  category_id?: string;
  county_id?: string;
  sub_county_id?: string;
  code?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}
