"use client";

import { useCurrentUser } from "./useAuth";
import {
  UserRole,
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getEffectivePermissions,
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

// Hook to get the user's API-returned permission grants
const useApiPermissions = (): Record<string, boolean> | undefined => {
  const user = useCurrentUser();
  return user?.permissions;
};

// Hook to check if user has a specific permission
export const useHasPermission = (permission: Permission): boolean => {
  const role = useUserRole();
  const apiPermissions = useApiPermissions();
  if (!role) return false;

  return hasPermission(role, permission, apiPermissions);
};

// Hook to check if user has any of the given permissions
export const useHasAnyPermission = (permissions: Permission[]): boolean => {
  const role = useUserRole();
  const apiPermissions = useApiPermissions();
  if (!role) return false;

  return hasAnyPermission(role, permissions, apiPermissions);
};

// Hook to check if user has all of the given permissions
export const useHasAllPermissions = (permissions: Permission[]): boolean => {
  const role = useUserRole();
  const apiPermissions = useApiPermissions();
  if (!role) return false;

  return hasAllPermissions(role, permissions, apiPermissions);
};

// Hook to get all permissions for current user
export const useUserPermissions = (): Permission[] => {
  const role = useUserRole();
  const apiPermissions = useApiPermissions();
  if (!role) return [];

  return getEffectivePermissions(role, apiPermissions);
};
