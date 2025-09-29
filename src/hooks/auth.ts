// Authentication hooks and utilities
export {
  useAuth,
  useLogin,
  useLogout,
  useUserProfile,
  useIsAuthenticated,
  useCurrentUser,
  useAuthGuard,
  authKeys,
} from "./useAuth";

// Authentication guards and route protection
export {
  useProtectedRoute,
  useGuestRoute,
  useRoleGuard,
  useAuthPersistence,
} from "./useAuthGuards";

// Authentication context (optional)
export { AuthProvider, useAuthContext } from "./useAuthContext";
