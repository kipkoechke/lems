"use client";

import { Permission } from "@/lib/rbac";
import { useUserPermissions } from "@/hooks/usePermissions";

/** Grouping keys. Order of the groups themselves lives in `NAV_GROUPS`. */
export type NavGroupKey =
  | "registry"
  | "devices"
  | "equipment"
  | "reports"
  | "administration"
  | "integrations"
  | "vendor"
  | "patient-care"
  | "finance";

export interface NavItem {
  label: string;
  href: string;
  permission: Permission;
  icon?: React.ReactNode;
  /**
   * Which collapsible section this sits under. Left off for the handful of
   * items that stay pinned at the top.
   */
  group?: NavGroupKey;
  description?: string;
}

/**
 * The sidebar's sections, in the order they are shown.
 *
 * The admin list had grown to nineteen entries in one column, which is past
 * the point where scrolling finds anything. Related surfaces are gathered
 * here so the column reads as a handful of areas instead: the registry you
 * maintain, the devices on the network, what the estate is doing, the
 * oversight reports, and the admin controls.
 *
 * A role that can only see a few items gets a flat list instead — see
 * `GROUPING_THRESHOLD` in the sidebar.
 */
export const NAV_GROUPS: { key: NavGroupKey; label: string }[] = [
  { key: "registry", label: "Registry" },
  { key: "devices", label: "Devices & Integration" },
  { key: "equipment", label: "Equipment Oversight" },
  { key: "reports", label: "Reports" },
  { key: "administration", label: "Administration" },
  { key: "integrations", label: "Integrations" },
  { key: "vendor", label: "Vendor" },
  { key: "patient-care", label: "Patient Care" },
  { key: "finance", label: "Finance" },
];

// Navigation items based on user roles and permissions
const NAV_ITEMS: NavItem[] = [
  // Dashboard - first item for all authenticated users
  {
    label: "Dashboard",
    href: "/dashboard",
    permission: Permission.VIEW_DASHBOARD,
    description: "System overview and key metrics",
  },

  // System Admin surfaces — grouped by area, see NAV_GROUPS.
  {
    label: "Facilities",
    href: "/facilities",
    permission: Permission.VIEW_FACILITIES,
    group: "registry",
    description: "Manage healthcare facilities",
  },
  {
    label: "Vendors",
    href: "/vendors",
    permission: Permission.VIEW_VENDORS,
    group: "registry",
    description: "Manage equipment vendors",
  },
  {
    label: "Contracts",
    href: "/contracts",
    permission: Permission.VIEW_CONTRACTS,
    group: "registry",
    description: "Manage service contracts",
  },
  {
    label: "Equipment",
    href: "/equipments",
    permission: Permission.VIEW_EQUIPMENTS,
    group: "registry",
    description: "Manage medical equipment",
  },
  {
    label: "Lots",
    href: "/lots",
    permission: Permission.VIEW_LOTS,
    group: "registry",
    description: "Manage equipment lots",
  },
  {
    label: "Services",
    href: "/services",
    permission: Permission.VIEW_SERVICES,
    group: "registry",
    description: "View services offered",
  },
  {
    label: "SHA Procedures",
    href: "/procedures",
    permission: Permission.ONBOARD_SERVICES,
    group: "registry",
    description: "Manage SHA procedures and reimbursements",
  },
  {
    label: "Equipment Status",
    href: "/equipment-status",
    permission: Permission.VIEW_EQUIPMENT_STATUS,
    group: "equipment",
    description: "Equipment status history and uptime",
  },
  {
    label: "Users",
    href: "/users",
    permission: Permission.CREATE_FACILITY_USERS,
    group: "administration",
    description: "Manage system users",
  },
  {
    label: "Permissions",
    href: "/admin/permissions",
    permission: Permission.MANAGE_PERMISSIONS,
    group: "administration",
    description: "Manage permission definitions",
  },
  {
    label: "Revenue Distributions",
    href: "/settings/revenue-distributions",
    permission: Permission.MANAGE_REVENUE_DISTRIBUTIONS,
    group: "administration",
    description: "Vendor / facility revenue share periods",
  },
  {
    label: "Medical Requests",
    href: "/requests",
    permission: Permission.VIEW_MEDICAL_REQUESTS,
    group: "devices",
    description: "EMR imaging orders and MWL workflow",
  },
  {
    label: "DICOM",
    href: "/dicom",
    permission: Permission.MANAGE_DICOM,
    group: "devices",
    description: "Orthanc server and modality registration",
  },
  {
    label: "Ping Requests",
    href: "/ping-requests",
    permission: Permission.MANAGE_DICOM,
    group: "devices",
    description:
      "Approvals, the device activity log and devices awaiting installation",
  },
  {
    label: "Facility Readiness",
    href: "/readiness",
    permission: Permission.VIEW_EQUIPMENT_STATUS,
    group: "equipment",
    description: "Which machines are proven working, and what is blocking the rest",
  },
  {
    label: "Equipment Utilization",
    href: "/equipment-utilization",
    permission: Permission.VIEW_EQUIPMENT_STATUS,
    group: "equipment",
    description:
      "Worklists, pulls and results per machine, including the idle ones",
  },
  {
    label: "Facility Ranking",
    href: "/facilities/ranking",
    permission: Permission.VIEW_REPORTS,
    group: "reports",
    description: "Facilities by booking volume and completion rate",
  },
  {
    label: "Non-SHA Studies",
    href: "/studies/unmatched",
    permission: Permission.VIEW_UNMATCHED_STUDIES,
    group: "devices",
    description: "Studies that arrived with no VEMS order behind them",
  },
  {
    label: "SHA Interventions",
    href: "/sha/interventions",
    permission: Permission.VIEW_SHA_INTERVENTIONS,
    group: "reports",
    description: "Completed interventions for SHA",
  },

  // Integration-role surfaces (/provider, /payer).
  {
    label: "Provider Bookings",
    href: "/provider/bookings",
    permission: Permission.VIEW_PROVIDER_BOOKINGS,
    group: "integrations",
    description: "Bookings created via the provider portal",
  },
  {
    label: "Payer Validation",
    href: "/payer/validate",
    permission: Permission.VALIDATE_PAYER_SERVICES,
    group: "integrations",
    description: "Validate services for claim processing",
  },

  // Vendor self-service items — vendor-scoped API surface
  // (/vendors/{vendor}/...). Only the vendor role holds these permissions.
  {
    label: "My Equipment",
    href: "/vendor/equipments",
    permission: Permission.VIEW_VENDOR_EQUIPMENTS,
    group: "vendor",
    description: "Manage your equipment",
  },
  {
    label: "Bookings",
    href: "/vendor/bookings",
    permission: Permission.VIEW_VENDOR_BOOKINGS,
    group: "vendor",
    description: "Bookings on your equipment",
  },
  {
    label: "Contracts",
    href: "/vendor/contracts",
    permission: Permission.VIEW_VENDOR_CONTRACTS,
    group: "vendor",
    description: "Your facility contracts",
  },
  {
    label: "My Profile",
    href: "/vendor/profile",
    permission: Permission.VIEW_VENDOR_PROFILE,
    group: "vendor",
    description: "View and update your vendor profile",
  },

  // Patient workflow and finance items.
  {
    label: "Patients",
    href: "/patients",
    permission: Permission.VIEW_PATIENTS,
    group: "patient-care",
    description: "Manage patient records",
  },
  {
    label: "Worklist",
    href: "/practitioner/worklist",
    permission: Permission.VIEW_WORKLIST,
    group: "patient-care",
    description: "Services scheduled at your facility",
  },
  {
    label: "Booked Services",
    href: "/bookings/booked",
    permission: Permission.VIEW_BOOKED_SERVICES,
    group: "patient-care",
    description: "View pending bookings",
  },
  {
    label: "Confirmed Bookings",
    href: "/bookings/confirmed",
    permission: Permission.VIEW_CONFIRMED_BOOKINGS,
    group: "patient-care",
    description: "View confirmed bookings",
  },
  {
    label: "Approved Services",
    href: "/bookings/approved",
    permission: Permission.VIEW_APPROVED_SERVICES,
    group: "patient-care",
    description: "View approved services",
  },
  {
    label: "Completed Services",
    href: "/bookings/completed",
    permission: Permission.VIEW_COMPLETED_SERVICES,
    group: "patient-care",
    description: "View completed services",
  },
  {
    label: "Finance Approval",
    href: "/finance",
    permission: Permission.FINANCE_APPROVAL,
    group: "finance",
    description: "Approve pending bookings",
  },
  {
    label: "Sync to SHA",
    href: "/bookings/synced",
    permission: Permission.SYNC_TO_SHA,
    group: "finance",
    description: "Synchronize bookings to SHA",
  },
  {
    label: "Service Completion",
    href: "/lab",
    permission: Permission.SERVICE_COMPLETION,
    group: "patient-care",
    description: "Complete lab services",
  },

  // Reports and Analytics
  // {
  //   label: "Reports",
  //   href: "/reports",
  //   permission: Permission.VIEW_REPORTS,
  //   description: "View system reports",
  // },
  // Payments — vendor only. The vendor view is built from /vendor/bookings and
  // /vendor/dashboard, both documented. There is no documented facility
  // payments endpoint, so facility roles get no Payments entry rather than a
  // page backed by a route the API reference does not publish.
  {
    label: "Payments",
    href: "/finance/payments",
    permission: Permission.VIEW_VENDOR_PAYMENTS,
    group: "finance",
    description: "Your revenue share per service delivered",
  },
];

/** A section of the sidebar: a labelled group, or the pinned items above them. */
export interface NavSection {
  key: string;
  /** Absent for the pinned items, which need no heading of their own. */
  label?: string;
  items: NavItem[];
}

/**
 * The navigation this caller may see, gathered into sections.
 *
 * Grouping by permission rather than by role matters: a facility admin holds
 * `VIEW_CONTRACTS` for the same entry a system admin does, and the two must
 * land in the same place. Items whose permission is not granted are dropped
 * before the groups are built, so a group nobody can reach simply is not
 * rendered.
 */
export const useAccessibleNavSections = (): NavSection[] => {
  // The whole granted set at once, rather than a hook per item.
  const granted = useUserPermissions();

  const visible = NAV_ITEMS.filter((item) => granted.includes(item.permission));

  const pinned = visible.filter((item) => !item.group);
  const sections: NavSection[] = pinned.length
    ? [{ key: "pinned", items: pinned }]
    : [];

  for (const group of NAV_GROUPS) {
    const items = visible.filter((item) => item.group === group.key);
    if (items.length) {
      sections.push({ key: group.key, label: group.label, items });
    }
  }

  return sections;
};

/**
 * The nav entry a path belongs to, or `null`.
 *
 * Matching is by longest href, so `/facilities/ranking` highlights the
 * ranking entry rather than the facilities register above it — and a detail
 * page like `/equipments/{id}` still lights up the entry it descends from,
 * which is what tells you where you are when the section is collapsed.
 */
export const activeNavHref = (
  pathname: string,
  sections: NavSection[],
): string | null => {
  let match: string | null = null;

  for (const section of sections) {
    for (const item of section.items) {
      const hit =
        pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (hit && (!match || item.href.length > match.length)) {
        match = item.href;
      }
    }
  }

  return match;
};

// Role-specific quick actions
const ROLE_QUICK_ACTIONS = {
  // System Admin actions
  onboard_facility: {
    label: "Onboard Facility",
    href: "/facilities/new",
    permission: Permission.ONBOARD_FACILITY,
    className: "bg-blue-600 hover:bg-blue-700",
  },
  create_users: {
    label: "Create Users",
    href: "/users/new",
    permission: Permission.CREATE_FACILITY_USERS,
    className: "bg-green-600 hover:bg-green-700",
  },
  onboard_vendor: {
    label: "Add Vendor",
    href: "/vendors/new",
    permission: Permission.ONBOARD_VENDORS,
    className: "bg-purple-600 hover:bg-purple-700",
  },
  add_equipment: {
    label: "Add Equipment",
    href: "/equipments/new",
    permission: Permission.ONBOARD_EQUIPMENT,
    className: "bg-indigo-600 hover:bg-indigo-700",
  },
  create_contract: {
    label: "Create Contract",
    href: "/contracts/new",
    permission: Permission.CREATE_CONTRACTS,
    className: "bg-emerald-600 hover:bg-emerald-700",
  },

  // Medical staff actions
  register_patient: {
    label: "Register Patient",
    href: "/patients/new",
    permission: Permission.GET_PATIENT_FROM_REGISTRY,
    className: "bg-teal-600 hover:bg-teal-700",
  },
  patient_booking: {
    label: "New Booking",
    href: "/bookings/new",
    permission: Permission.PATIENT_BOOKING_CONSENT,
    className: "bg-indigo-600 hover:bg-indigo-700",
  },

  // Finance staff actions - removed payments-related actions
};

export const useAccessibleQuickActions = () => {
  // The whole granted set once, rather than a hook call per action.
  const granted = useUserPermissions();
  return Object.values(ROLE_QUICK_ACTIONS).filter((action) =>
    granted.includes(action.permission),
  );
};
