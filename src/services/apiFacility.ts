import axios from "../lib/axios";

export interface Facility {
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
}

// Legacy interface for backward compatibility
export interface LegacyFacility {
  id: string;
  name: string;
  code: string;
  contactInfo: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Enums for better type safety
export enum RegulatoryStatus {
  PENDING_REGISTRATION = "Pending Registration",
  LICENSED = "Licensed",
  SUSPENDED = "Suspended",
  REVOKED = "Revoked",
}

export enum FacilityType {
  DISPENSARY = "Dispensary",
  HEALTH_CENTER = "Health Center",
  HOSPITAL = "Hospital",
  CLINIC = "Clinic",
}

export enum Owner {
  MINISTRY_OF_HEALTH = "Ministry of Health",
  PRIVATE = "Private",
  FAITH_BASED = "Faith Based",
  NGO = "NGO",
}

export enum OperationStatus {
  OPERATIONAL = "Operational",
  NON_OPERATIONAL = "Non-Operational",
  TEMPORARILY_CLOSED = "Temporarily Closed",
}

export enum KephLevel {
  LEVEL_1 = "Level 1",
  LEVEL_2 = "Level 2",
  LEVEL_3 = "Level 3",
  LEVEL_4 = "Level 4",
  LEVEL_5 = "Level 5",
  LEVEL_6 = "Level 6",
}

export interface EditFacilityForm {
  name: string;
  code: string;
  ward_id: string;
  sub_county_id: string;
  county_id: string;
  is_active: string;
  regulatory_status: RegulatoryStatus | string;
  facility_type: FacilityType | string;
  owner: Owner | string;
  operation_status: OperationStatus | string;
  keph_level: KephLevel | string;
}

export interface CreateFacilityForm {
  name: string;
  code: string;
  ward_id: string;
  sub_county_id: string;
  county_id: string;
  is_active?: string;
  regulatory_status: RegulatoryStatus | string;
  facility_type: FacilityType | string;
  owner: Owner | string;
  operation_status: OperationStatus | string;
  keph_level: KephLevel | string;
}

// Legacy form interface for backward compatibility
export interface LegacyEditFacilityForm {
  name: string;
  code: string;
  contact_info: string;
}

// Utility types
export type FacilityForm = Omit<
  Facility,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;
export type LegacyFacilityForm = Omit<LegacyFacility, "id">;

// Pagination link interface
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Paginated response interface
export interface PaginatedFacilityResponse {
  current_page: number;
  data: Facility[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// API Response types
export interface FacilityResponse {
  data: Facility[];
  message?: string;
  status?: string;
}

export interface SingleFacilityResponse {
  data: Facility;
  message?: string;
  status?: string;
}

// Pagination parameters interface
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// Search parameters interface
export interface SearchParams {
  search?: string; // General search across multiple fields
  name?: string; // Search by facility name
  code?: string; // Search by facility code
  facility_type?: string; // Search by facility type
  owner?: string; // Search by owner
  regulatory_status?: string; // Search by regulatory status
  operation_status?: string; // Search by operation status
  keph_level?: string; // Search by KEPH level
}

// Filter types for API queries
export interface FacilityFilters {
  county_id?: string;
  sub_county_id?: string;
  ward_id?: string;
  facility_type?: FacilityType | string;
  operation_status?: OperationStatus | string;
  regulatory_status?: RegulatoryStatus | string;
  owner?: Owner | string;
  keph_level?: KephLevel | string;
  is_active?: string;
}

// Combined filters with pagination and search
export interface FacilityQueryParams
  extends FacilityFilters,
    PaginationParams,
    SearchParams {}

export const getFacilities = async (
  params?: FacilityQueryParams
): Promise<Facility[]> => {
  const response = await axios.get("/facilities", { params });
  // If the response has pagination structure, return the data array
  if (
    response.data &&
    response.data.data &&
    Array.isArray(response.data.data)
  ) {
    return response.data.data;
  }
  // Otherwise, assume the response is already an array
  return Array.isArray(response.data) ? response.data : [];
};

export const getFacilitiesPaginated = async (
  params?: FacilityQueryParams
): Promise<PaginatedFacilityResponse> => {
  const response = await axios.get("/facilities", { params });
  return response.data;
};

export const getFacilityById = async (id: string): Promise<Facility> => {
  const response = await axios.get(`/facility/${id}`);
  return response.data.data;
};

export const getFacilityByCode = async (code: string): Promise<Facility> => {
  const facilities = await getFacilities({ code });
  const facility = facilities.find((f: Facility) => f.code === code);
  if (!facility) {
    throw new Error(`Facility with code ${code} not found`);
  }
  return facility;
};

export const createFacility = async (data: FacilityForm): Promise<Facility> => {
  const response = await axios.post("/create-facility", data);
  return response.data.data;
};

export const updateFacility = async (
  id: string,
  data: Partial<EditFacilityForm>
): Promise<EditFacilityForm> => {
  const response = await axios.put(`/update-facility/${id}`, data);
  return response.data.data;
};

export const deleteFacility = async (id: string): Promise<void> => {
  await axios.delete<void>(`/Facility/${id}`);
};

// Utility functions for building search queries
export const buildFacilitySearchParams = (
  searchTerm: string
): Partial<FacilityQueryParams> => {
  if (!searchTerm.trim()) {
    return {};
  }

  return {
    search: searchTerm.trim(),
  };
};

export const buildAdvancedFacilitySearchParams = (filters: {
  searchTerm?: string;
  facilityType?: string;
  owner?: string;
  regulatoryStatus?: string;
  operationStatus?: string;
  kephLevel?: string;
  countyId?: string;
  subCountyId?: string;
  wardId?: string;
  isActive?: string;
}): Partial<FacilityQueryParams> => {
  const params: Partial<FacilityQueryParams> = {};

  if (filters.searchTerm?.trim()) {
    params.search = filters.searchTerm.trim();
  }

  if (filters.facilityType) {
    params.facility_type = filters.facilityType;
  }

  if (filters.owner) {
    params.owner = filters.owner;
  }

  if (filters.regulatoryStatus) {
    params.regulatory_status = filters.regulatoryStatus;
  }

  if (filters.operationStatus) {
    params.operation_status = filters.operationStatus;
  }

  if (filters.kephLevel) {
    params.keph_level = filters.kephLevel;
  }

  if (filters.countyId) {
    params.county_id = filters.countyId;
  }

  if (filters.subCountyId) {
    params.sub_county_id = filters.subCountyId;
  }

  if (filters.wardId) {
    params.ward_id = filters.wardId;
  }

  if (filters.isActive !== undefined) {
    params.is_active = filters.isActive;
  }

  return params;
};

// Utility functions for URL search parameters
export const parseSearchParamsFromUrl = (
  searchParams: URLSearchParams
): Partial<FacilityQueryParams> => {
  const params: Partial<FacilityQueryParams> = {};

  // Basic search
  const search = searchParams.get("search");
  if (search) {
    params.search = search;
  }

  // Pagination
  const page = searchParams.get("page");
  if (page) {
    params.page = parseInt(page, 10) || 1;
  }

  const perPage = searchParams.get("per_page");
  if (perPage) {
    params.per_page = parseInt(perPage, 10) || 10;
  }

  // Filters
  const facilityType = searchParams.get("facility_type");
  if (facilityType) {
    params.facility_type = facilityType;
  }

  const owner = searchParams.get("owner");
  if (owner) {
    params.owner = owner;
  }

  const regulatoryStatus = searchParams.get("regulatory_status");
  if (regulatoryStatus) {
    params.regulatory_status = regulatoryStatus;
  }

  const operationStatus = searchParams.get("operation_status");
  if (operationStatus) {
    params.operation_status = operationStatus;
  }

  const kephLevel = searchParams.get("keph_level");
  if (kephLevel) {
    params.keph_level = kephLevel;
  }

  const countyId = searchParams.get("county_id");
  if (countyId) {
    params.county_id = countyId;
  }

  const subCountyId = searchParams.get("sub_county_id");
  if (subCountyId) {
    params.sub_county_id = subCountyId;
  }

  const wardId = searchParams.get("ward_id");
  if (wardId) {
    params.ward_id = wardId;
  }

  const isActive = searchParams.get("is_active");
  if (isActive !== null) {
    params.is_active = isActive;
  }

  return params;
};

export const buildUrlSearchParams = (
  params: Partial<FacilityQueryParams>
): string => {
  const searchParams = new URLSearchParams();

  // Add all non-empty parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
};

export const updateUrlWithSearchParams = (
  router: any,
  basePath: string,
  params: Partial<FacilityQueryParams>,
  replace: boolean = true
) => {
  const queryString = buildUrlSearchParams(params);
  const newUrl = queryString ? `${basePath}?${queryString}` : basePath;

  if (replace) {
    router.replace(newUrl, { scroll: false });
  } else {
    router.push(newUrl);
  }
};
