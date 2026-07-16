import axios from "../lib/axios";

export type PayerReferenceType = "booking_reference" | "claim_id";

export const PAYER_REFERENCE_TYPES: {
  value: PayerReferenceType;
  label: string;
}[] = [
  { value: "booking_reference", label: "Booking Reference" },
  { value: "claim_id", label: "Claim ID" },
];

export interface PayerServiceLine {
  id: string;
  service: {
    code: string;
    name: string;
    lot?: { number: string; name: string } | null;
    scheduled_date?: string | null;
    status?: string;
    completed_at?: string | null;
  };
  equipment?: {
    id?: string;
    name?: string;
    serial_number?: string;
    status?: string;
    category?: string;
  } | null;
  vendor?: {
    id?: string;
    code?: string;
    name?: string;
    contract_number?: string;
  } | null;
  cost: {
    tariff: number;
    sha: number;
    cash: number;
    vendor_share: number;
    facility_share: number;
  };
}

export interface PayerValidationResult {
  message: string;
  // Present only when the lookup misses — the API returns 200 with code "404".
  code?: string;
  reference_type?: string;
  reference_number?: string;
  booking?: {
    booking_number: string;
    claim_id?: string | null;
    source?: string;
    status?: string;
    created_at?: string;
    completed_at?: string | null;
  };
  patient?: {
    cr_no?: string;
    name?: string;
    identification_type?: string;
    identification_no?: string;
    date_of_birth?: string;
    phone?: string;
  };
  facility?: {
    fr_code?: string;
    name?: string;
    level?: string;
    type?: string;
    ownership?: string;
    sha_contract_status?: string;
    county?: string;
    is_active?: boolean;
  };
  financial_summary?: {
    total_tariff: number;
    total_sha: number;
    total_cash: number;
    other_insurance: number;
    eligibility_verified: boolean;
    finance_approved_at?: string | null;
  };
  services?: PayerServiceLine[];
}

// GET /payer/validate
export const validatePayerServices = async (
  referenceType: PayerReferenceType,
  referenceNumber: string,
): Promise<PayerValidationResult> => {
  const response = await axios.get<PayerValidationResult>("/payer/validate", {
    params: {
      reference_type: referenceType,
      reference_number: referenceNumber,
    },
  });
  return response.data;
};
