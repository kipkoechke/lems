import axiosInstance from "@/lib/axios";

export interface SyncedBooking {
  id: string;
  booking_id: string;
  synched_at: string | null;
  synch_status: "complete" | "pending" | "failed";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  batch_id: string | null;
  facility_batch_id: string | null;
  booking: {
    id: string;
    booking_number: string;
    patient_id: string;
    booking_status: string;
    approval_status: string;
    payment_mode: string;
    booked_by: string | null;
    approved_by: string | null;
    booking_date: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    override: string;
    patient: {
      id: string;
      name: string;
      phone: string;
      date_of_birth: string;
      identification_no: string | null;
      sha_number: string | null;
      cr_no: string | null;
      hh_no: string | null;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
    };
    services: Array<{
      id: string;
      booking_id: string;
      vendor_facility_lot_service_pivot_id: string;
      service_completion_by: string | null;
      booking_date: string;
      vendor_share: string;
      facility_share: string;
      service_status: string;
      created_at: string;
      updated_at: string;
      deleted_at: string | null;
      service: {
        id: string;
        ven_flty_lot_pivot_id: string;
        service_id: string;
        is_active: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        equipment_id: string | null;
      };
    }>;
  };
}

export interface SyncBookingsResponse {
  results: {
    current_page: number;
    data: SyncedBooking[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export const fetchSyncedBookings = async (
  page: number = 1,
  filters?: {
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    facility_id?: string;
  }
): Promise<SyncBookingsResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
  }

  const response = await axiosInstance.get(
    `/bookings/sync?${params.toString()}`
  );
  return response.data;
};

export interface CreateBatchRequest {
  sync_ids: string[];
}

export interface CreateBatchResponse {
  message: string;
  batch: {
    id: string;
    sync_ids: string[];
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export const createBatch = async (
  data: CreateBatchRequest
): Promise<CreateBatchResponse> => {
  const response = await axiosInstance.post("/batches", data);
  return response.data;
};

export interface VendorBatch {
  id: string;
  batch_no: string;
  vendor_id: string;
  amount: string; // Total amount as string
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  status: string; // pending, completed, etc.
  vendor: {
    id: string;
    name: string;
    code: string;
    is_active: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
}

export interface VendorBatchesResponse {
  current_page: number;
  data: VendorBatch[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const fetchVendorBatches = async (
  page: number = 1
): Promise<VendorBatchesResponse> => {
  const response = await axiosInstance.get(`/batches?page=${page}`);
  return response.data;
};

// Facility Payments Interfaces
export interface FacilityPayment {
  id: string;
  batch_no: string;
  facility_id: string;
  amount: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  facility: {
    id: string;
    name: string;
    code: string;
    ward_id: string;
    sub_county_id: string;
    county_id: string;
    is_active: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    regulatory_status: string;
    facility_type: string;
    owner: string;
    operation_status: string;
    keph_level: string;
  };
}

export interface FacilityPaymentsResponse {
  current_page: number;
  data: FacilityPayment[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const fetchFacilityPayments = async (
  page: number = 1
): Promise<FacilityPaymentsResponse> => {
  const response = await axiosInstance.get(`/facility/payments?page=${page}`);
  return response.data;
};
