// User roles enum for type safety
export enum UserRole {
  ADMIN = "admin", // System admin
  F_ADMIN = "f_admin", // Facility admin
  USER = "user", // Regular user
  S_ADMIN = "s_admin", // Super admin
  F_FINANCE = "f_finance", // Facility finance
  F_LAB = "f_lab", // Facility lab
  F_MEDICAL = "f_medical", // Facility medical (Clinician/Practitioner)
  C_REC = "c_rec", // Claim records
  B_APPROVER = "b_approver", // Batch approver
}

// Permission actions enum
export enum Permission {
  // System Admin permissions
  ONBOARD_FACILITY = "onboard_facility",
  CREATE_FACILITY_USERS = "create_facility_users",
  ONBOARD_VENDORS = "onboard_vendors",
  ONBOARD_EQUIPMENT = "onboard_equipment",
  CREATE_CONTRACTS = "create_contracts",
  ONBOARD_LOTS = "onboard_lots",
  ONBOARD_SERVICES = "onboard_services",

  // Facility Medical (Clinician) permissions
  GET_PATIENT_FROM_REGISTRY = "get_patient_from_registry",
  SELECT_SERVICES = "select_services",
  PATIENT_BOOKING_CONSENT = "patient_booking_consent",
  SEND_PATIENT_TO_FINANCE = "send_patient_to_finance",

  // Facility Finance permissions
  CHECK_SHA_ELIGIBILITY = "check_sha_eligibility",
  PROCESS_PAYMENT_MODES = "process_payment_modes",
  SEND_PATIENT_TO_EQUIPMENT_ROOM = "send_patient_to_equipment_room",
  CANCEL_BOOKING = "cancel_booking",
  VIEW_PATIENT_QUEUE = "view_patient_queue",
  SYNC_TO_SHA = "sync_to_sha",
  FINANCE_APPROVAL = "finance_approval",

  // Facility Lab permissions
  SERVICE_COMPLETION = "service_completion",

  // Medical staff specific permissions
  VIEW_BOOKED_SERVICES = "view_booked_services",
  VIEW_APPROVED_SERVICES = "view_approved_services",
  VIEW_COMPLETED_SERVICES = "view_completed_services",

  // Common permissions
  VIEW_DASHBOARD = "view_dashboard",
  VIEW_REPORTS = "view_reports",
  VIEW_PATIENTS = "view_patients",
  VIEW_BOOKINGS = "view_bookings",
  VIEW_EQUIPMENTS = "view_equipments",
  VIEW_FACILITIES = "view_facilities",
  VIEW_VENDORS = "view_vendors",
  VIEW_CONTRACTS = "view_contracts",
  VIEW_LOTS = "view_lots",
  VIEW_SERVICES = "view_services",
  VIEW_PAYMENTS = "view_payments",
  VIEW_TRENDS = "view_trends",
}

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.S_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(Permission),
  ],

  [UserRole.ADMIN]: [
    // System admin permissions
    Permission.ONBOARD_FACILITY,
    Permission.CREATE_FACILITY_USERS,
    Permission.ONBOARD_VENDORS,
    Permission.ONBOARD_EQUIPMENT,
    Permission.CREATE_CONTRACTS,
    Permission.ONBOARD_LOTS,
    Permission.ONBOARD_SERVICES,
    Permission.VIEW_REPORTS,
    Permission.VIEW_FACILITIES,
    Permission.VIEW_VENDORS,
    Permission.VIEW_CONTRACTS,
    Permission.VIEW_EQUIPMENTS,
    Permission.VIEW_LOTS,
    Permission.VIEW_SERVICES,
    Permission.VIEW_TRENDS,
  ],

  [UserRole.F_ADMIN]: [
    // Facility admin permissions
    Permission.CREATE_FACILITY_USERS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_EQUIPMENTS,
    Permission.VIEW_SERVICES,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_TRENDS,
  ],

  [UserRole.F_MEDICAL]: [
    // Facility Medical (Clinician/Practitioner) permissions
    Permission.GET_PATIENT_FROM_REGISTRY,
    Permission.SELECT_SERVICES,
    Permission.PATIENT_BOOKING_CONSENT,
    Permission.SEND_PATIENT_TO_FINANCE,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_SERVICES,
    Permission.VIEW_EQUIPMENTS,
    Permission.VIEW_BOOKED_SERVICES,
  ],

  [UserRole.F_FINANCE]: [
    // Facility Finance permissions
    Permission.CHECK_SHA_ELIGIBILITY,
    Permission.PROCESS_PAYMENT_MODES,
    Permission.SEND_PATIENT_TO_EQUIPMENT_ROOM,
    Permission.CANCEL_BOOKING,
    Permission.VIEW_PATIENT_QUEUE,
    Permission.VIEW_PAYMENTS,
    Permission.SYNC_TO_SHA,
    Permission.FINANCE_APPROVAL,
    Permission.VIEW_APPROVED_SERVICES,
  ],

  [UserRole.F_LAB]: [
    // Facility Lab permissions
    Permission.SERVICE_COMPLETION,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_EQUIPMENTS,
    Permission.VIEW_SERVICES,
    Permission.VIEW_COMPLETED_SERVICES,
  ],

  [UserRole.C_REC]: [
    // Claim Records permissions
    Permission.VIEW_PATIENTS,
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PAYMENTS,
  ],

  [UserRole.B_APPROVER]: [
    // Batch Approver permissions
    Permission.VIEW_BOOKINGS,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_REPORTS,
    Permission.SYNC_TO_SHA,
  ],

  [UserRole.USER]: [
    // Regular user permissions
    Permission.VIEW_PATIENTS,
    Permission.VIEW_BOOKINGS,
  ],
};

// Helper functions
export const getUserPermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export const hasPermission = (
  userRole: UserRole,
  permission: Permission
): boolean => {
  const permissions = getUserPermissions(userRole);
  return permissions.includes(permission);
};

export const hasAnyPermission = (
  userRole: UserRole,
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) => hasPermission(userRole, permission));
};

export const hasAllPermissions = (
  userRole: UserRole,
  permissions: Permission[]
): boolean => {
  return permissions.every((permission) => hasPermission(userRole, permission));
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.S_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "System Admin",
  [UserRole.F_ADMIN]: "Facility Admin",
  [UserRole.F_MEDICAL]: "Clinician/Practitioner",
  [UserRole.F_FINANCE]: "Facility Finance",
  [UserRole.F_LAB]: "Facility Lab",
  [UserRole.C_REC]: "Claim Records",
  [UserRole.B_APPROVER]: "Batch Approver",
  [UserRole.USER]: "Regular User",
};

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_DISPLAY_NAMES[role] || role;
};
