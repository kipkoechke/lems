import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./useAuth";

// Custom hook for protected routes
export const useProtectedRoute = (redirectTo: string = "/login") => {
  const router = useRouter();
  const { data: auth, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !auth?.isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [auth?.isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated: auth?.isAuthenticated ?? false,
    isLoading,
    user: auth?.user,
  };
};

// Custom hook for guest routes (redirect authenticated users)
export const useGuestRoute = (redirectTo: string = "/") => {
  const router = useRouter();
  const { data: auth, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && auth?.isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [auth?.isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated: auth?.isAuthenticated ?? false,
    isLoading,
  };
};

// Custom hook for role-based access
export const useRoleGuard = (allowedRoles: string[], redirectTo: string = "/unauthorized") => {
  const router = useRouter();
  const { data: auth, isLoading } = useAuth();

  const hasAccess = auth?.user?.role ? allowedRoles.includes(auth.user.role) : false;

  useEffect(() => {
    if (!isLoading && auth?.isAuthenticated && !hasAccess) {
      router.replace(redirectTo);
    }
  }, [auth?.isAuthenticated, hasAccess, isLoading, router, redirectTo]);

  return {
    hasAccess,
    isAuthenticated: auth?.isAuthenticated ?? false,
    isLoading,
    user: auth?.user,
  };
};

// Custom hook for authentication state persistence
export const useAuthPersistence = () => {
  const queryClient = useQueryClient();

  // Function to invalidate auth queries (useful for token refresh)
  const invalidateAuth = () => {
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  // Function to reset auth state
  const resetAuth = () => {
    queryClient.removeQueries({ queryKey: ["auth"] });
  };

  return {
    invalidateAuth,
    resetAuth,
  };
};