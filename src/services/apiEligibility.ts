import axios from "../lib/axios";

// Contributor eligibility payload
export interface ContributorEligibilityRequest {
  identificationType: string;
  identificationNumber: string;
}

// Dependant eligibility payload
export interface DependantEligibilityRequest {
  identificationType: string;
  identificationNumber: string;
  parentIdentificationType: string;
  parentIdentificationNumber: string;
}

// Combined type for all eligibility requests
export type EligibilityRequest =
  | ContributorEligibilityRequest
  | DependantEligibilityRequest;

export interface EligibilityResponse {
  eligible: boolean;
  message: string;
  coverage_end_date?: string;
}

// Check contributor eligibility
export const checkContributorEligibility = async (
  data: ContributorEligibilityRequest
): Promise<EligibilityResponse> => {
  const response = await axios.post("/patients/eligibility", data);
  return response.data;
};

// Check dependant eligibility
export const checkDependantEligibility = async (
  data: DependantEligibilityRequest
): Promise<EligibilityResponse> => {
  const response = await axios.post("/patients/eligibility", data);
  return response.data;
};

// Generic eligibility check (determines type based on payload)
export const checkEligibility = async (
  data: EligibilityRequest
): Promise<EligibilityResponse> => {
  const response = await axios.post("/patients/eligibility", data);
  return response.data;
};
