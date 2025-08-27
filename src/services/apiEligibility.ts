import axios from "../lib/axios";

export interface EligibilityRequest {
  identification_type: string;
  identification_number: string;
}

export interface EligibilityResponse {
  eligible: number;
  reason: string;
  possible_solution?: string;
}

export const checkEligibility = async (
  params: EligibilityRequest
): Promise<EligibilityResponse> => {
  const response = await axios.get("/eligibility", { params });
  return response.data;
};
