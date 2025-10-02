"use client";

import { ReactNode } from "react";
import { Permission } from "../lib/rbac";
import {
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
} from "../hooks/usePermissions";

interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SinglePermissionGateProps extends PermissionGateProps {
  permission: Permission;
}

interface MultiplePermissionGateProps extends PermissionGateProps {
  permissions: Permission[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
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

// Component to conditionally render content based on multiple permissions
export const MultiplePermissionGate = ({
  permissions,
  children,
  fallback = null,
  requireAll = false,
}: MultiplePermissionGateProps) => {
  const hasAllAccess = useHasAllPermissions(permissions);
  const hasAnyAccess = useHasAnyPermission(permissions);

  const hasAccess = requireAll ? hasAllAccess : hasAnyAccess;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Show content only to admins
export const AdminGate = ({
  children,
  fallback = null,
}: PermissionGateProps) => (
  <MultiplePermissionGate
    permissions={[
      Permission.ONBOARD_FACILITY,
      Permission.CREATE_FACILITY_USERS,
    ]}
    fallback={fallback}
  >
    {children}
  </MultiplePermissionGate>
);

// Show content only to facility medical staff (clinicians)
export const MedicalStaffGate = ({
  children,
  fallback = null,
}: PermissionGateProps) => (
  <PermissionGate
    permission={Permission.GET_PATIENT_FROM_REGISTRY}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

// Show content only to facility finance staff
export const FinanceStaffGate = ({
  children,
  fallback = null,
}: PermissionGateProps) => (
  <PermissionGate
    permission={Permission.CHECK_SHA_ELIGIBILITY}
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

// Show content for patient workflow (medical and finance staff)
export const PatientWorkflowGate = ({
  children,
  fallback = null,
}: PermissionGateProps) => (
  <MultiplePermissionGate
    permissions={[
      Permission.GET_PATIENT_FROM_REGISTRY,
      Permission.CHECK_SHA_ELIGIBILITY,
      Permission.VIEW_PATIENT_QUEUE,
    ]}
    fallback={fallback}
  >
    {children}
  </MultiplePermissionGate>
);

// Show access denied message
export const AccessDenied = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600">
        You don&apos;t have permission to access this resource.
      </p>
    </div>
  </div>
);
