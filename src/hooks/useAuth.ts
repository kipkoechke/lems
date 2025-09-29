import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  loginFetcher,
  getAuthData,
  setAuthData,
  clearAuthData,
  fetchUserProfile,
  LoginResponse,
  AuthState,
  User,
  Facility,
} from "../services/apiAuth";

// Query keys for consistent cache management
export const authKeys = {
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

      // Store auth data (including cookies for middleware)
      setAuthData(user, facility, token);

      // Update React Query cache
      queryClient.setQueryData(authKeys.auth, {
        user,
        facility,
        token,
        isAuthenticated: true,
      });

      // Show success message
      toast.success("Login successful!");

      // Don't redirect here - let the component handle it or middleware will handle it
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
      // If you have a logout endpoint, call it here
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
export const useAuth = () => {
  return useQuery({
    queryKey: authKeys.auth,
    queryFn: (): AuthState => {
      return getAuthData();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

// Custom hook for getting user profile (for future use)
export const useUserProfile = () => {
  const { data: auth } = useAuth();

  return useQuery({
    queryKey: authKeys.profile,
    queryFn: fetchUserProfile,
    enabled: !!auth?.isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Custom hook to check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { data: auth, isLoading } = useAuth();

  if (isLoading) return false;
  return auth?.isAuthenticated ?? false;
};

// Custom hook for getting current user
export const useCurrentUser = (): User | null => {
  const { data: auth } = useAuth();
  return auth?.user ?? null;
};

// Custom hook for getting current facility
export const useCurrentFacility = (): Facility | null => {
  const { data: auth } = useAuth();
  return auth?.facility ?? null;
};

// Custom hook for authentication guard
export const useAuthGuard = (redirectTo: string = "/login") => {
  const router = useRouter();
  const { data: auth, isLoading } = useAuth();

  const isAuthenticated = auth?.isAuthenticated ?? false;

  // Redirect if not authenticated (after loading)
  if (!isLoading && !isAuthenticated) {
    router.push(redirectTo);
  }

  return { isAuthenticated, isLoading, user: auth?.user };
};
