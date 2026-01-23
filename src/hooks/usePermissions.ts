"use client";

import { useCurrentUser } from "./useAuth";
import {
  UserRole,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
} from "../lib/rbac";

// Hook to get current user's role
export const useUserRole = (): UserRole | null => {
  const user = useCurrentUser();
  if (!user?.role) return null;

  // Ensure the role is a valid UserRole
  return Object.values(UserRole).includes(user.role as UserRole)
    ? (user.role as UserRole)
    : null;
};

// Hook to check if user has a specific permission
export const useHasPermission = (permission: Permission): boolean => {
  const role = useUserRole();
  if (!role) return false;

  return hasPermission(role, permission);
};

// Hook to check if user has any of the given permissions
export const useHasAnyPermission = (permissions: Permission[]): boolean => {
  const role = useUserRole();
  if (!role) return false;

  return hasAnyPermission(role, permissions);
};

// Hook to check if user has all of the given permissions
export const useHasAllPermissions = (permissions: Permission[]): boolean => {
  const role = useUserRole();
  if (!role) return false;

  return hasAllPermissions(role, permissions);
};

// Hook to get all permissions for current user
export const useUserPermissions = (): Permission[] => {
  const role = useUserRole();
  if (!role) return [];

  return getUserPermissions(role);
};

// Hook to check if user has any admin role
export const useIsAdmin = (): boolean => {
  const role = useUserRole();
  return (
    role === UserRole.ADMIN ||
    role === UserRole.S_ADMIN ||
    role === UserRole.F_ADMIN
  );
};

// Hook to check if user is system admin
export const useIsSystemAdmin = (): boolean => {
  const role = useUserRole();
  return role === UserRole.ADMIN || role === UserRole.S_ADMIN;
};

// Hook to check if user is facility staff
export const useIsFacilityStaff = (): boolean => {
  const role = useUserRole();
  return [
    UserRole.F_ADMIN,
    UserRole.F_PRACTITIONER,
    UserRole.F_FINANCE,
    UserRole.F_EQUIPMENT_USER,
  ].includes(role!);
};

// Hook to check if user is a vendor
export const useIsVendor = (): boolean => {
  const role = useUserRole();
  return role === UserRole.VENDOR;
};

// Hook to check if user can access a specific route
export const useCanAccessRoute = (routePermissions: Permission[]): boolean => {
  return useHasAnyPermission(routePermissions);
};
