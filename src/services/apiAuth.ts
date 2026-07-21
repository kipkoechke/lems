import axios from "../lib/axios";
import { LoginFormData } from "../lib/validations";

// Role object from API response
interface UserRole {
  key: string;
  label: string;
  type: string;
}

// Entity object from API response (can be facility or vendor)
export interface UserEntity {
  type: string;
  id: string;
  code?: string;
  fr_code?: string;
  name: string;
  keph_level?: string;
  facility_type?: string;
}

// Raw user from API response
interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  // API-returned permission grants (keyed by permission code, e.g. "manage_equipment")
  permissions?: Record<string, boolean>;
  profile?: {
    salutation: string | null;
    gender: string | null;
    professional_id: string | null;
    registration_id: string | null;
    status: string;
  };
  // Legacy: vendor/facility info as a typed entity block (older API versions).
  entity?: UserEntity;
  // Newer API versions return vendor (and facility) as top-level keys.
  vendor?: { id: string; code: string; name: string };
  facility?: { id: string; code?: string; fr_code?: string; name: string };
}

// Normalized user for app usage
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // Normalized to just the key
  roleLabel?: string;
  roleType?: string;
  entity?: UserEntity;
  // API-returned permission grants (keyed by permission code, e.g. "manage_equipment")
  permissions?: Record<string, boolean>;
}

export interface Facility {
  id: string | null;
  code: string | null;
  name: string | null;
}

export interface LoginResponse {
  user: User;
  facility: Facility;
  token: string;
}

export interface AuthState {
  user: User | null;
  facility: Facility | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Helper to normalise the API user into the flat app User shape.
// Newer API versions deliver vendor/facility as top-level keys instead of
// the legacy `entity` envelope — convert them into the entity format so
// every downstream consumer (useMyVendor, useCurrentFacility, etc.) keeps
// working without changes.
const normalizeUser = (apiUser: ApiUser): User => {
  // Resolve entity: legacy entity block wins; otherwise synthesise from the
  // vendor/facility keys the current API returns.
  let entity = apiUser.entity;
  if (!entity && apiUser.vendor) {
    entity = {
      type: "vendor",
      id: apiUser.vendor.id,
      code: apiUser.vendor.code,
      name: apiUser.vendor.name,
    };
  } else if (!entity && apiUser.facility) {
    entity = {
      type: "facility",
      id: apiUser.facility.id,
      code: apiUser.facility.code || apiUser.facility.fr_code,
      name: apiUser.facility.name,
    };
  }

  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    role:
      apiUser.role?.key ||
      (typeof apiUser.role === "string" ? apiUser.role : "user"),
    roleLabel: apiUser.role?.label,
    roleType: apiUser.role?.type,
    entity,
    permissions: apiUser.permissions,
  };
};

// Helper to extract facility from API response.
// For vendor users the facility slot doubles as the vendor-identity carrier
// so that useMyVendor() can resolve vendorId via facility.id as a fallback.
const extractFacility = (apiUser: ApiUser): Facility => {
  // Facility users: use entity (legacy) or top-level facility key (new API).
  if (apiUser.entity?.type === "facility" || apiUser.facility) {
    const src = apiUser.entity?.type === "facility" ? apiUser.entity : null;
    const f = src || apiUser.facility;
    return {
      id: f?.id || null,
      code: f?.fr_code || f?.code || null,
      name: f?.name || null,
    };
  }
  // Vendor users: stash vendor id + code so useMyVendor() can find it.
  if (
    apiUser.entity?.type === "vendor" ||
    apiUser.vendor ||
    apiUser.role?.type === "vendor"
  ) {
    const v = apiUser.entity?.type === "vendor" ? apiUser.entity : apiUser.vendor;
    return {
      id: v?.id || null,
      code: v?.code || null,
      name: v?.name || null,
    };
  }
  return { id: null, code: null, name: null };
};

// Login fetcher function for React Query
export const loginFetcher = async (
  credentials: LoginFormData,
): Promise<LoginResponse> => {
  try {
    const response = await axios.post("/auth/login", credentials);
    const data = response.data;

    // Normalize the user data
    const normalizedUser = normalizeUser(data.user);
    const facility = extractFacility(data.user);

    return {
      user: normalizedUser,
      facility,
      token: data.token,
    };
  } catch (error: any) {
    // For React Query, we want to throw errors to trigger the error state
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data) {
      throw new Error("Login failed");
    }
    throw new Error("Network error occurred. Please try again.");
  }
};

// Auth utility functions
export const setAuthData = (
  user: User,
  facility: Facility,
  token: string,
): void => {
  // Set in localStorage
  localStorage.setItem("authToken", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("facility", JSON.stringify(facility));

  // Set in cookies for middleware access
  // Cookie should be accessible across the entire domain
  document.cookie = `authToken=${token}; path=/; max-age=${
    7 * 24 * 60 * 60
  }; samesite=lax`;
};

export const getAuthData = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, facility: null, token: null, isAuthenticated: false };
  }

  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");
  const facilityStr = localStorage.getItem("facility");

  if (!token || !userStr) {
    return { user: null, facility: null, token: null, isAuthenticated: false };
  }

  try {
    let user = JSON.parse(userStr);
    const facility = facilityStr ? JSON.parse(facilityStr) : null;

    // Handle legacy data where role might be an object
    if (user.role && typeof user.role === "object" && user.role.key) {
      user = {
        ...user,
        role: user.role.key,
        roleLabel: user.role.label,
        roleType: user.role.type,
      };
      // Update localStorage with normalized user
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { user, facility, token, isAuthenticated: true };
  } catch {
    return { user: null, facility: null, token: null, isAuthenticated: false };
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("facility");

  // Clear cookies
  document.cookie =
    "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};

// User profile fetcher (for future use)
export const fetchUserProfile = async (): Promise<User> => {
  const response = await axios.get("/profile");
  return response.data;
};
