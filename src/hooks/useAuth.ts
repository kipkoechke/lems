import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  AuthState,
  clearAuthData,
  Facility,
  getAuthData,
  loginFetcher,
  logoutFetcher,
  LoginResponse,
  setAuthData,
  User,
} from "../services/apiAuth";
import { getDashboard } from "@/services/apiDashboard";
import { getBookingsWithPagination } from "@/services/apiBooking";
import { facilityDashboardFilters } from "@/features/facilities/facilityDashboardQuery";
import { isFacilityRole } from "@/lib/rbac";

// Query keys for consistent cache management
const authKeys = {
  auth: ["auth"] as const,
  user: ["auth", "user"] as const,
  profile: ["auth", "profile"] as const,
};


/**
 * Warms the landing dashboard's data during the post-login navigation.
 *
 * Each key must match the hook that reads it or the entry is never used, so
 * the filters come from the same builders the pages use. Failures are ignored:
 * this is an optimisation, and the page will fetch for itself.
 */
const prefetchDashboard = (
  queryClient: ReturnType<typeof useQueryClient>,
  user: User,
  facility: Facility | null,
) => {
  const prefetch = (queryKey: unknown[], queryFn: () => Promise<unknown>) =>
    queryClient.prefetchQuery({ queryKey, queryFn }).catch(() => {});

  // Vendors are skipped on purpose: their dashboard key includes both the id
  // resolved from /vendor/profile and a computed filter object, so a prefetch
  // here would warm a key the page never looks up.
  if (user.role === "vendor") return;

  if (isFacilityRole(user.role)) {
    const filters = facilityDashboardFilters(facility?.id);
    prefetch(["bookings-paginated", filters], () =>
      getBookingsWithPagination(filters),
    );
    return;
  }

  prefetch(["admin-dashboard"], () => getDashboard());
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

      // Start the landing page's own request now, while the router is still
      // navigating. Without this the dashboard only begins fetching once it
      // mounts, so the user waits out the whole round trip on a blank page.
      prefetchDashboard(queryClient, user, facility);
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
    mutationFn: logoutFetcher,
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
