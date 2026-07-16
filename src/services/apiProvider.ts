import axios from "../lib/axios";

export interface ProviderBookingService {
  id?: string;
  code?: string;
  name?: string;
  lot?: { number: string; name: string } | null;
  equipment?: { code?: string; name?: string } | null;
  practitioner?: { id?: string; name?: string } | null;
  scheduled_date?: string | null;
  status?: string;
  shareDistribution?: {
    tariff: number;
    vendorPercentage: number;
    facilityPercentage: number;
  };
  payment?: { cash?: number; sha?: number };
  breakdown?: {
    cash?: { vendor: number; facility: number };
    sha?: { vendor: number; facility: number };
  };
}

export interface ProviderBooking {
  id: string;
  booking_number: string;
  visit_id: string;
  claim_id?: string | null;
  patient?: {
    id?: string;
    name?: string;
    identification_no?: string;
    cr_no?: string;
  } | null;
  facility?: { name?: string; fr_code?: string } | null;
  status?: string;
  services?: ProviderBookingService[];
  created_at?: string;
}

export interface ProviderBookingCosts {
  booking: {
    id: string;
    booking_number: string;
    visit_id: string;
    claim_id?: string | null;
  };
  patient?: { name?: string; cr_no?: string } | null;
  facility?: { name?: string; fr_code?: string } | null;
  services: ProviderBookingService[];
}

const unwrap = <T,>(data: unknown): T => {
  const body = data as { data?: T };
  return (body?.data ?? data) as T;
};

// GET /provider/bookings
export const getProviderBookings = async (): Promise<ProviderBooking[]> => {
  const response = await axios.get("/provider/bookings");
  const data = unwrap<ProviderBooking[]>(response.data);
  return Array.isArray(data) ? data : [];
};

// GET /provider/bookings/{visitId}
export const getProviderBooking = async (
  visitId: string,
): Promise<ProviderBooking> => {
  const response = await axios.get(`/provider/bookings/${visitId}`);
  return unwrap<ProviderBooking>(response.data);
};

// GET /provider/bookings/{visitId}/costs
export const getProviderBookingCosts = async (
  visitId: string,
): Promise<ProviderBookingCosts> => {
  const response = await axios.get(`/provider/bookings/${visitId}/costs`);
  return unwrap<ProviderBookingCosts>(response.data);
};

// POST /provider/bookings/{visitId}/claim
export const assignProviderClaim = async (
  visitId: string,
  claimId: string,
): Promise<ProviderBooking> => {
  const response = await axios.post(`/provider/bookings/${visitId}/claim`, {
    claim_id: claimId,
  });
  return unwrap<ProviderBooking>(response.data);
};

// GET /provider/facilities/services
export const getProviderFacilityServices = async (params?: {
  fr_code?: string;
}): Promise<unknown[]> => {
  const response = await axios.get("/provider/facilities/services", { params });
  const data = unwrap<unknown[]>(response.data);
  return Array.isArray(data) ? data : [];
};
