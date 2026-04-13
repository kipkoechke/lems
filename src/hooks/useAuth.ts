import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  AuthState,
  clearAuthData,
  Facility,
  getAuthData,
  loginFetcher,
  LoginResponse,
  setAuthData,
  User,
} from "../services/apiAuth";

// Query keys for consistent cache management
const authKeys = {
  auth: ["auth"] as const,
  user: ["auth", "user"] as const,
  profile: ["auth", "profile"] as const,
};

// Custom hook for login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginFetcher,
    onSuccess: (data: LoginResponse) => {
      const { user, facility, token } = data;
      setAuthData(user, facility, token);
      queryClient.setQueryData(authKeys.auth, {
        user,
        facility,
        token,
        isAuthenticated: true,
      });
      toast.success("Login successful!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed. Please try again.");
    },
  });
};

// Custom hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // logout endpoint, call it here
      // await axios.post("/logout");
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear auth data (including cookies)
      clearAuthData();

      // Clear all queries
      queryClient.clear();

      // Show success message
      toast.success("Logged out successfully");

      // Force a page reload to trigger middleware redirect
      window.location.href = "/login";
    },
    onError: () => {
      toast.error("Logout failed. Please try again.");
    },
  });
};

// Custom hook for getting current auth state
const useAuth = () => {
  return useQuery({
    queryKey: authKeys.auth,
    queryFn: (): AuthState => {
      return getAuthData();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

// Custom hook for getting current user
export const useCurrentUser = (): User | null => {
  const { data: auth } = useAuth();
  return auth?.user ?? null;
};

// Custom hook for getting current user with loading state
export const useCurrentUserWithLoading = () => {
  const { data: auth, isLoading } = useAuth();
  return { user: auth?.user ?? null, isLoading };
};

// Custom hook for getting current facility
export const useCurrentFacility = (): Facility | null => {
  const { data: auth } = useAuth();
  return auth?.facility ?? null;
};
