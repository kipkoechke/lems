"use client";

import { ReactNode } from "react";
import { useHasPermission } from "../hooks/usePermissions";
import { Permission } from "../lib/rbac";

interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SinglePermissionGateProps extends PermissionGateProps {
  permission: Permission;
}

// Component to conditionally render content based on a single permission
export const PermissionGate = ({
  permission,
  children,
  fallback = null,
}: SinglePermissionGateProps) => {
  const hasAccess = useHasPermission(permission);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
