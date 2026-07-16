import axios from "../lib/axios";

export interface VendorBookingService {
  lot?: { number: string; name: string } | null;
  service: { id: string; code: string; name: string };
  scheduled_date: string | null;
  tariff: string;
  revenue?: {
    vendor_share: string;
    facility_share: string;
  } | null;
  equipment?: {
    id: string;
    code: string;
    name: string;
    status: string;
  } | null;
  practitioner?: { id: string; name: string } | null;
  status: string;
}

export interface VendorBooking {
  id: string;
  booking_number: string;
  patient?: { id: string; name: string } | null;
  facility?: { id: string; name: string; fr_code?: string } | null;
  source: string;
  status: string;
  payment?: {
    tariff: string;
    cash: string;
    other_insurance: string;
    sha: string;
  } | null;
  services?: VendorBookingService[];
  created_at?: string;
}

export interface VendorBookingsParams {
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface VendorBookingsResult {
  bookings: VendorBooking[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// GET /vendors/{vendor}/bookings — bookings for all equipment owned by the vendor
export const getVendorBookings = async (
  vendorId: string,
  params: VendorBookingsParams = {},
): Promise<VendorBookingsResult> => {
  const response = await axios.get<{
    data: VendorBooking[];
    pagination?: VendorBookingsResult["pagination"];
  }>(`/vendors/${vendorId}/bookings`, { params });

  return {
    bookings: response.data.data ?? [],
    pagination: response.data.pagination,
  };
};
