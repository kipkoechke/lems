// User roles enum for type safety
export enum UserRole {
  ADMIN = "admin", // System admin
  F_ADMIN = "f_admin", // Facility admin
  USER = "user", // Regular user
  S_ADMIN = "s_admin", // Super admin
  F_FINANCE = "f_finance", // Facility finance
  F_EQUIPMENT_USER = "f_equipment_user", // Facility equipment user (Lab)
  F_PRACTITIONER = "f_practitioner", // Facility practitioner (Clinician/Practitioner)
  F_VIEW_ONLY = "f_view_only", // Facility view-only account (HRIO), read-only
  C_REC = "c_rec", // Claim records
  B_APPROVER = "b_approver", // Batch approver
  VENDOR = "vendor", // Vendor user
  PROVIDER_PORTAL = "provider_portal", // HMIS integration (routes under /provider)
  PAYER = "payer", // Claim validation (routes under /payer)
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
  VIEW_CONFIRMED_BOOKINGS = "view_confirmed_bookings",
  VIEW_WORKLIST = "view_worklist",

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

  // Vendor-specific permissions
  VIEW_MAINTENANCE_HISTORY = "view_maintenance_history",
  VIEW_VENDOR_REVENUE = "view_vendor_revenue",
  VIEW_VENDOR_PAYMENTS = "view_vendor_payments",
  // Vendor self-service — these map to the vendor-scoped API surface
  // (/vendors/{vendor}/...) and must never be granted to admin roles, whose
  // equivalents live under the admin endpoints.
  VIEW_VENDOR_PROFILE = "view_vendor_profile",
  VIEW_VENDOR_CONTRACTS = "view_vendor_contracts",
  VIEW_VENDOR_BOOKINGS = "view_vendor_bookings",
  VIEW_VENDOR_EQUIPMENTS = "view_vendor_equipments",

  // Facility Admin-specific permissions
  REQUEST_MAINTENANCE = "request_maintenance",
  // Register facility-owned equipment via POST /facility/equipments, which
  // the API restricts to f_admin. Viewing the facility's equipment is open to
  // every facility role and uses VIEW_EQUIPMENTS.
  MANAGE_FACILITY_EQUIPMENT = "manage_facility_equipment",
  VIEW_FACILITY_PAYMENTS = "view_facility_payments",

  // System-admin-only surfaces. These map to endpoints the API restricts to
  // the `admin` role (/admin/permissions, /equipment-status/*,
  // /settings/revenue-distributions), so facility admins must not see them
  // even though they hold the broader user/equipment permissions.
  MANAGE_PERMISSIONS = "manage_permissions",
  VIEW_EQUIPMENT_STATUS = "view_equipment_status",
  MANAGE_REVENUE_DISTRIBUTIONS = "manage_revenue_distributions",
  MANAGE_DICOM = "manage_dicom",
  VIEW_MEDICAL_REQUESTS = "view_medical_requests",
  // Write actions on a medical request (cancel, retarget, regenerate MWL).
  // Read access alone must not expose these — a view-only facility account
  // can list requests but cannot act on them.
  MANAGE_MEDICAL_REQUESTS = "manage_medical_requests",
  VIEW_SHA_INTERVENTIONS = "view_sha_interventions",

  // Integration-role surfaces. These live under their own API prefixes
  // (/provider, /payer) and are restricted to the matching system role.
  VIEW_PROVIDER_BOOKINGS = "view_provider_bookings",
  VALIDATE_PAYER_SERVICES = "validate_payer_services",
}

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.S_ADMIN]: [
    // Super admin has all permissions
    ...Object.values(Permission),
  ],

  [UserRole.ADMIN]: [
    // System admin permissions
    Permission.VIEW_DASHBOARD,
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
    Permission.VIEW_LOTS,
    Permission.VIEW_SERVICES,
    Permission.VIEW_EQUIPMENTS,
    Permission.MANAGE_PERMISSIONS,
    Permission.VIEW_EQUIPMENT_STATUS,
    Permission.MANAGE_REVENUE_DISTRIBUTIONS,
    Permission.MANAGE_DICOM,
    Permission.VIEW_MEDICAL_REQUESTS,
    Permission.MANAGE_MEDICAL_REQUESTS,
    Permission.VIEW_SHA_INTERVENTIONS,
  ],

  [UserRole.F_ADMIN]: [
    // Facility admin permissions.
    //
    // CREATE_FACILITY_USERS is back: /users now scopes a facility admin to
    // their own facility and lets them provision view-only, practitioner,
    // finance and equipment accounts (never another admin).
    Permission.VIEW_DASHBOARD,
    Permission.CREATE_FACILITY_USERS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_CONTRACTS,
    Permission.VIEW_EQUIPMENTS,
    Permission.MANAGE_FACILITY_EQUIPMENT,
    Permission.REQUEST_MAINTENANCE,
    Permission.VIEW_SERVICES,
    Permission.VIEW_WORKLIST,
  ],

  [UserRole.F_PRACTITIONER]: [
    // Facility Practitioner (Clinician/Practitioner) permissions
    Permission.VIEW_WORKLIST,
    Permission.GET_PATIENT_FROM_REGISTRY,
    Permission.SELECT_SERVICES,
    Permission.PATIENT_BOOKING_CONSENT,
    Permission.SEND_PATIENT_TO_FINANCE,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_SERVICES,
    Permission.VIEW_EQUIPMENTS,
    Permission.VIEW_BOOKED_SERVICES,
    Permission.VIEW_CONFIRMED_BOOKINGS,
  ],

  [UserRole.F_VIEW_ONLY]: [
    // Read-only facility account (HRIO), provisioned by the facility admin.
    // Limited to the GET surfaces in the API reference's View Only table:
    // no equipment, no worklist, no user management, no write actions.
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_SERVICES,
    Permission.VIEW_CONTRACTS,
    Permission.VIEW_EQUIPMENTS,
    Permission.VIEW_MEDICAL_REQUESTS,
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
    // /facility/equipments is open to every facility role.
    Permission.VIEW_EQUIPMENTS,
  ],

  [UserRole.F_EQUIPMENT_USER]: [
    // Facility equipment user (Lab) permissions
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

  [UserRole.VENDOR]: [
    // Vendor permissions — scoped to the vendor's own profile, equipment,
    // contacts and bookings. Vendors have no API access to facilities,
    // the vendor directory, contracts, lots or services (see API reference
    // "Vendor User" role), so those must not appear in their navigation.
    Permission.VIEW_DASHBOARD,
    // NOTE: deliberately NOT VIEW_EQUIPMENTS — the /equipments page reads
    // /admin/equipment, which vendors cannot call. They get the vendor-scoped
    // equipment page instead.
    Permission.VIEW_VENDOR_EQUIPMENTS,
    Permission.VIEW_VENDOR_BOOKINGS,
    Permission.VIEW_VENDOR_CONTRACTS,
    Permission.VIEW_VENDOR_PROFILE,
    Permission.VIEW_MAINTENANCE_HISTORY,
    Permission.VIEW_VENDOR_REVENUE,
    Permission.VIEW_VENDOR_PAYMENTS,
    Permission.VIEW_PAYMENTS,
  ],

  [UserRole.USER]: [
    // Regular user permissions
    Permission.VIEW_PATIENTS,
    Permission.VIEW_BOOKINGS,
  ],

  [UserRole.PROVIDER_PORTAL]: [
    // HMIS integration account — only the /provider surface.
    Permission.VIEW_PROVIDER_BOOKINGS,
  ],

  [UserRole.PAYER]: [
    // Claim validation account — only the /payer surface.
    Permission.VALIDATE_PAYER_SERVICES,
  ],
};

/**
 * Roles whose API surface is scoped to a single facility.
 *
 * Per the API reference role tables, these roles cannot call the admin
 * oversight endpoints (`/admin/equipment`, `/equipment/{id}`, `/analytics/*`);
 * their equipment view is `/equipment/facility/{facility}/operational`.
 */
export const FACILITY_ROLES: string[] = [
  UserRole.F_ADMIN,
  UserRole.F_VIEW_ONLY,
  UserRole.F_PRACTITIONER,
  UserRole.F_FINANCE,
  UserRole.F_EQUIPMENT_USER,
];

export const isFacilityRole = (role?: string | null): boolean =>
  !!role && FACILITY_ROLES.includes(role);

/**
 * Accounts that may read but never write.
 *
 * The permission map already withholds every write grant from these roles, so
 * anything behind a `MANAGE_*` gate is hidden already. This exists for the
 * controls that are not gated on one — bulk approve/reject, say — where the
 * button would otherwise be offered and answered with a 403.
 */
export const READ_ONLY_ROLES: string[] = [UserRole.F_VIEW_ONLY];

export const isReadOnlyRole = (role?: string | null): boolean =>
  !!role && READ_ONLY_ROLES.includes(role);

// Helper functions
export const getUserPermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

// ---------------------------------------------------------------------------
// API permission mapping
//
// When the login response includes a `permissions` object (e.g.
// { "manage_equipment": true, "view_contracts": true }), those grants are
// mapped to internal Permission enum values so they can be checked with the
// same hasPermission / PermissionGate primitives used everywhere else.
// ---------------------------------------------------------------------------

/**
 * Map of API permission codes (as returned in the login `permissions` object)
 * to the corresponding internal {@link Permission} enum value(s).
 *
 * Add entries here as the API exposes new permission codes.
 */
const API_PERMISSION_MAP: Record<string, Permission[]> = {
  // -- Vendor-scoped permissions --
  manage_equipment: [Permission.VIEW_VENDOR_EQUIPMENTS],
  view_contracts: [Permission.VIEW_VENDOR_CONTRACTS, Permission.VIEW_CONTRACTS],
  view_bookings: [Permission.VIEW_VENDOR_BOOKINGS, Permission.VIEW_BOOKINGS],
  view_reports: [Permission.VIEW_REPORTS],
  view_dashboard: [Permission.VIEW_DASHBOARD],
  view_patients: [Permission.VIEW_PATIENTS],
  view_equipments: [Permission.VIEW_EQUIPMENTS],
  view_facilities: [Permission.VIEW_FACILITIES],
  view_vendors: [Permission.VIEW_VENDORS],
  view_lots: [Permission.VIEW_LOTS],
  view_services: [Permission.VIEW_SERVICES],
  view_payments: [Permission.VIEW_PAYMENTS],
  view_trends: [Permission.VIEW_TRENDS],
  view_maintenance_history: [Permission.VIEW_MAINTENANCE_HISTORY],
  view_vendor_revenue: [Permission.VIEW_VENDOR_REVENUE],
  view_vendor_payments: [Permission.VIEW_VENDOR_PAYMENTS],
  view_vendor_profile: [Permission.VIEW_VENDOR_PROFILE],
  // -- Facility-scoped permissions --
  request_maintenance: [Permission.REQUEST_MAINTENANCE],
  manage_facility_equipment: [Permission.MANAGE_FACILITY_EQUIPMENT],
  view_facility_payments: [Permission.VIEW_FACILITY_PAYMENTS],
  // -- Admin-scoped permissions --
  manage_permissions: [Permission.MANAGE_PERMISSIONS],
  view_equipment_status: [Permission.VIEW_EQUIPMENT_STATUS],
  manage_revenue_distributions: [Permission.MANAGE_REVENUE_DISTRIBUTIONS],
  manage_dicom: [Permission.MANAGE_DICOM],
  view_medical_requests: [Permission.VIEW_MEDICAL_REQUESTS],
  manage_medical_requests: [Permission.MANAGE_MEDICAL_REQUESTS],
  view_sha_interventions: [Permission.VIEW_SHA_INTERVENTIONS],
  // -- Practitioner permissions --
  get_patient_from_registry: [Permission.GET_PATIENT_FROM_REGISTRY],
  select_services: [Permission.SELECT_SERVICES],
  patient_booking_consent: [Permission.PATIENT_BOOKING_CONSENT],
  send_patient_to_finance: [Permission.SEND_PATIENT_TO_FINANCE],
  view_worklist: [Permission.VIEW_WORKLIST],
  view_booked_services: [Permission.VIEW_BOOKED_SERVICES],
  view_confirmed_bookings: [Permission.VIEW_CONFIRMED_BOOKINGS],
  // -- Finance permissions --
  check_sha_eligibility: [Permission.CHECK_SHA_ELIGIBILITY],
  process_payment_modes: [Permission.PROCESS_PAYMENT_MODES],
  send_patient_to_equipment_room: [Permission.SEND_PATIENT_TO_EQUIPMENT_ROOM],
  cancel_booking: [Permission.CANCEL_BOOKING],
  view_patient_queue: [Permission.VIEW_PATIENT_QUEUE],
  sync_to_sha: [Permission.SYNC_TO_SHA],
  finance_approval: [Permission.FINANCE_APPROVAL],
  view_approved_services: [Permission.VIEW_APPROVED_SERVICES],
  // -- Equipment user (Lab) permissions --
  service_completion: [Permission.SERVICE_COMPLETION],
  view_completed_services: [Permission.VIEW_COMPLETED_SERVICES],
  // -- Integration roles --
  view_provider_bookings: [Permission.VIEW_PROVIDER_BOOKINGS],
  validate_payer_services: [Permission.VALIDATE_PAYER_SERVICES],
  // -- Admin onboarding --
  onboard_facility: [Permission.ONBOARD_FACILITY],
  create_facility_users: [Permission.CREATE_FACILITY_USERS],
  onboard_vendors: [Permission.ONBOARD_VENDORS],
  onboard_equipment: [Permission.ONBOARD_EQUIPMENT],
  create_contracts: [Permission.CREATE_CONTRACTS],
  onboard_lots: [Permission.ONBOARD_LOTS],
  onboard_services: [Permission.ONBOARD_SERVICES],
};

/**
 * Translate API-returned permission grants into internal {@link Permission}
 * values. Permissions whose value is `false` (or absent) are ignored.
 */
export const resolveApiPermissions = (
  apiPermissions: Record<string, boolean> | undefined,
): Permission[] => {
  if (!apiPermissions) return [];

  const resolved: Permission[] = [];
  for (const [code, granted] of Object.entries(apiPermissions)) {
    if (!granted) continue;
    const mapped = API_PERMISSION_MAP[code];
    if (mapped) {
      resolved.push(...mapped);
    }
  }
  return resolved;
};

/**
 * Get the effective permissions for a user by merging role-based permissions
 * with any API-returned permission grants.
 */
export const getEffectivePermissions = (
  role: UserRole,
  apiPermissions?: Record<string, boolean>,
): Permission[] => {
  const rolePermissions = getUserPermissions(role);
  const apiResolved = resolveApiPermissions(apiPermissions);
  // Merge and deduplicate
  return [...new Set([...rolePermissions, ...apiResolved])];
};

export const hasPermission = (
  userRole: UserRole,
  permission: Permission,
  apiPermissions?: Record<string, boolean>,
): boolean => {
  const effective = getEffectivePermissions(userRole, apiPermissions);
  return effective.includes(permission);
};

export const hasAnyPermission = (
  userRole: UserRole,
  permissions: Permission[],
  apiPermissions?: Record<string, boolean>,
): boolean => {
  return permissions.some((permission) =>
    hasPermission(userRole, permission, apiPermissions),
  );
};

export const hasAllPermissions = (
  userRole: UserRole,
  permissions: Permission[],
  apiPermissions?: Record<string, boolean>,
): boolean => {
  return permissions.every((permission) =>
    hasPermission(userRole, permission, apiPermissions),
  );
};

// Role display names
const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.S_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "System Admin",
  [UserRole.F_ADMIN]: "Facility Admin",
  [UserRole.F_PRACTITIONER]: "Clinician/Practitioner",
  [UserRole.F_VIEW_ONLY]: "View Only (HRIO)",
  [UserRole.F_FINANCE]: "Facility Finance",
  [UserRole.F_EQUIPMENT_USER]: "Facility Equipment User (Lab)",
  [UserRole.C_REC]: "Claim Records",
  [UserRole.B_APPROVER]: "Batch Approver",
  [UserRole.VENDOR]: "Vendor User",
  [UserRole.USER]: "Regular User",
  [UserRole.PROVIDER_PORTAL]: "Provider Portal",
  [UserRole.PAYER]: "Payer",
};

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_DISPLAY_NAMES[role] || role;
};
