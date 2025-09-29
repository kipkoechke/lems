import axios from "../lib/axios";
import { LoginFormData } from "../lib/validations";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Facility {
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

// Login fetcher function for React Query
export const loginFetcher = async (credentials: LoginFormData): Promise<LoginResponse> => {
  try {
    const response = await axios.post("/login", credentials);
    // The response should match the format: { user, facility, token }
    return response.data;
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
export const setAuthData = (user: User, facility: Facility, token: string): void => {
  // Set in localStorage
  localStorage.setItem("authToken", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("facility", JSON.stringify(facility));
  
  // Set in cookies for middleware access
  document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
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
    const user = JSON.parse(userStr);
    const facility = facilityStr ? JSON.parse(facilityStr) : null;
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
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};

// User profile fetcher (for future use)
export const fetchUserProfile = async (): Promise<User> => {
  const response = await axios.get("/profile");
  return response.data;
};