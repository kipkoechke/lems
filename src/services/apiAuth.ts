import axios from "../lib/axios";
import { LoginFormData } from "../lib/validations";

// Role object from API response
export interface UserRole {
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
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profile: {
    salutation: string | null;
    gender: string | null;
    professional_id: string | null;
    registration_id: string | null;
    status: string;
  };
  entity: UserEntity;
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

// Helper to normalize API user to app user format
export const normalizeUser = (apiUser: ApiUser): User => {
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
    entity: apiUser.entity,
  };
};

// Helper to extract facility from API response
export const extractFacility = (apiUser: ApiUser): Facility => {
  if (apiUser.entity?.type === "facility") {
    return {
      id: apiUser.entity.id || null,
      code: apiUser.entity.fr_code || apiUser.entity.code || null,
      name: apiUser.entity.name || null,
    };
  }
  // For vendors, return null facility
  if (apiUser.entity?.type === "vendor") {
    return {
      id: apiUser.entity.id || null,
      code: apiUser.entity.code || null,
      name: apiUser.entity.name || null,
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

// Legacy function for backward compatibility
export const loginUser = loginFetcher;

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
