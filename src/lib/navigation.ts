"use client";

import { isScopedRole, Permission } from "@/lib/rbac";
import {
  useHasPermission,
  useUserPermissions,
  useUserRole,
} from "@/hooks/usePermissions";

interface NavItem {
  label: string;
  href: string;
  permission: Permission;
  icon?: React.ReactNode;
  description?: string;
  /** Items sharing a group collapse into one sidebar entry with a tab bar. */
  group?: NavGroupKey;
  /** The tab's name, when the sidebar label would repeat the group's. */
  tabLabel?: string;
}

/**
 * Sidebar groups.
 *
 * A system admin used to get about twenty-one sidebar entries, most of them
 * different views of the same few things. Each group is now one entry, and
 * its pages share a tab bar. The routes themselves are unchanged, so links
 * and bookmarks keep working — the tabs only link between them.
 *
 * Members of a group are listed together in NAV_ITEMS, in tab order.
 */
export type NavGroupKey =
  | "facilities"
  | "vendors"
  | "equipment"
  | "connectivity"
  | "sha"
  | "administration"
  | "bookings";

export const NAV_GROUPS: Record<
  NavGroupKey,
  { label: string; description: string }
> = {
  facilities: {
    label: "Facilities",
    description: "Facilities, their readiness and their ranking",
  },
  vendors: {
    label: "Vendors",
    description: "Vendors, their contracts and lots",
  },
  equipment: {
    label: "Equipment",
    description: "Machines, their status history and utilization",
  },
  connectivity: {
    label: "Connectivity",
    description: "DICOM, device pings, EMR orders and unmatched studies",
  },
  sha: {
    label: "SHA",
    description: "SHA procedures and interventions",
  },
  administration: {
    label: "Administration",
    description: "Users, permissions and revenue distributions",
  },
  bookings: {
    label: "Bookings",
    description: "Bookings at each stage, through to SHA",
  },
};

// Navigation items based on user roles and permissions
const NAV_ITEMS: NavItem[] = [
  // Dashboard - first item for all authenticated users
  {
    label: "Dashboard",
    href: "/dashboard",
    permission: Permission.VIEW_DASHBOARD,
    description: "System overview and key metrics",
  },

  // System Admin specific items
  {
    label: "Facilities",
    href: "/facilities",
    permission: Permission.VIEW_FACILITIES,
    description: "Manage healthcare facilities",
    group: "facilities",
  },
  {
    label: "Facility Readiness",
    tabLabel: "Readiness",
    href: "/readiness",
    permission: Permission.VIEW_EQUIPMENT_STATUS,
    description:
      "Which machines are proven working, and what is blocking the rest",
    group: "facilities",
  },
  {
    label: "Facility Ranking",
    tabLabel: "Ranking",
    href: "/facilities/ranking",
    permission: Permission.VIEW_REPORTS,
    description: "Facilities by booking volume and completion rate",
    group: "facilities",
  },
  {
    label: "Vendors",
    href: "/vendors",
    permission: Permission.VIEW_VENDORS,
    description: "Manage equipment vendors",
    group: "vendors",
  },
  {
    label: "Contracts",
    href: "/contracts",
    permission: Permission.VIEW_CONTRACTS,
    description: "Manage service contracts",
    group: "vendors",
  },
  {
    label: "Lots",
    href: "/lots",
    permission: Permission.VIEW_LOTS,
    description: "Manage equipment lots",
    group: "vendors",
  },
  {
    label: "Equipment",
    href: "/equipments",
    permission: Permission.VIEW_EQUIPMENTS,
    description: "Manage medical equipment",
    group: "equipment",
  },
  {
    label: "Equipment Status",
    tabLabel: "Status",
    href: "/equipment-status",
    permission: Permission.VIEW_EQUIPMENT_STATUS,
    description: "Equipment status history and uptime",
    group: "equipment",
  },
  {
    label: "Equipment Utilization",
    tabLabel: "Utilization",
    href: "/equipment-utilization",
    permission: Permission.VIEW_EQUIPMENT_STATUS,
    description:
      "Worklists, pulls and results per machine, including the idle ones",
    group: "equipment",
  },
  {
    label: "DICOM",
    href: "/dicom",
    permission: Permission.MANAGE_DICOM,
    description: "Orthanc server and modality registration",
    group: "connectivity",
  },
  {
    label: "Ping Requests",
    href: "/ping-requests",
    permission: Permission.MANAGE_DICOM,
    description:
      "Approvals, the device activity log and devices awaiting installation",
    group: "connectivity",
  },
  {
    label: "Medical Requests",
    href: "/requests",
    permission: Permission.VIEW_MEDICAL_REQUESTS,
    description: "EMR imaging orders and MWL workflow",
    group: "connectivity",
  },
  {
    label: "Non-SHA Studies",
    href: "/studies/unmatched",
    permission: Permission.VIEW_UNMATCHED_STUDIES,
    description: "Studies that arrived with no VEMS order behind them",
    group: "connectivity",
  },
  {
    label: "Services",
    href: "/services",
    permission: Permission.VIEW_SERVICES,
    description: "View services offered",
  },
  {
    label: "SHA Procedures",
    tabLabel: "Procedures",
    href: "/procedures",
    permission: Permission.ONBOARD_SERVICES,
    description: "Manage SHA procedures and reimbursements",
    group: "sha",
  },
  {
    label: "SHA Interventions",
    tabLabel: "Interventions",
    href: "/sha/interventions",
    permission: Permission.VIEW_SHA_INTERVENTIONS,
    description: "Completed interventions for SHA",
    group: "sha",
  },
  {
    label: "Users",
    href: "/users",
    permission: Permission.CREATE_FACILITY_USERS,
    description: "Manage system users",
    group: "administration",
  },
  {
    label: "Permissions",
    href: "/admin/permissions",
    permission: Permission.MANAGE_PERMISSIONS,
    description: "Manage permission definitions",
    group: "administration",
  },
  {
    label: "Revenue Distributions",
    href: "/settings/revenue-distributions",
    permission: Permission.MANAGE_REVENUE_DISTRIBUTIONS,
    description: "Vendor / facility revenue share periods",
    group: "administration",
  },

  // Integration-role items
  {
    label: "Provider Bookings",
    href: "/provider/bookings",
    permission: Permission.VIEW_PROVIDER_BOOKINGS,
    description: "Bookings created via the provider portal",
  },
  {
    label: "Payer Validation",
    href: "/payer/validate",
    permission: Permission.VALIDATE_PAYER_SERVICES,
    description: "Validate services for claim processing",
  },

  // Vendor self-service items — vendor-scoped API surface
  // (/vendors/{vendor}/...). Only the vendor role holds these permissions.
  // A handful of entries, so they stay ungrouped: a group would save nothing.
  {
    label: "My Equipment",
    href: "/vendor/equipments",
    permission: Permission.VIEW_VENDOR_EQUIPMENTS,
    description: "Manage your equipment",
  },
  {
    label: "Bookings",
    href: "/vendor/bookings",
    permission: Permission.VIEW_VENDOR_BOOKINGS,
    description: "Bookings on your equipment",
  },
  {
    label: "Contracts",
    href: "/vendor/contracts",
    permission: Permission.VIEW_VENDOR_CONTRACTS,
    description: "Your facility contracts",
  },
  {
    label: "My Profile",
    href: "/vendor/profile",
    permission: Permission.VIEW_VENDOR_PROFILE,
    description: "View and update your vendor profile",
  },

  // Patient workflow items (Medical and Finance staff)
  {
    label: "Patients",
    href: "/patients",
    permission: Permission.VIEW_PATIENTS,
    description: "Manage patient records",
  },
  {
    label: "Worklist",
    href: "/practitioner/worklist",
    permission: Permission.VIEW_WORKLIST,
    description: "Services scheduled at your facility",
  },
  {
    label: "Booked Services",
    tabLabel: "Booked",
    href: "/bookings/booked",
    permission: Permission.VIEW_BOOKED_SERVICES,
    description: "View pending bookings",
    group: "bookings",
  },
  {
    label: "Confirmed Bookings",
    tabLabel: "Confirmed",
    href: "/bookings/confirmed",
    permission: Permission.VIEW_CONFIRMED_BOOKINGS,
    description: "View confirmed bookings",
    group: "bookings",
  },
  {
    label: "Approved Services",
    tabLabel: "Approved",
    href: "/bookings/approved",
    permission: Permission.VIEW_APPROVED_SERVICES,
    description: "View approved services",
    group: "bookings",
  },
  {
    label: "Completed Services",
    tabLabel: "Completed",
    href: "/bookings/completed",
    permission: Permission.VIEW_COMPLETED_SERVICES,
    description: "View completed services",
    group: "bookings",
  },
  {
    label: "Sync to SHA",
    href: "/bookings/synced",
    permission: Permission.SYNC_TO_SHA,
    description: "Synchronize bookings to SHA",
    group: "bookings",
  },
  {
    label: "Finance Approval",
    href: "/finance",
    permission: Permission.FINANCE_APPROVAL,
    description: "Approve pending bookings",
  },
  {
    label: "Service Completion",
    href: "/lab",
    permission: Permission.SERVICE_COMPLETION,
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
    description: "Your revenue share per service delivered",
  },
];

// Component to filter navigation items based on user permissions
export const useAccessibleNavItems = (): NavItem[] => {
  return NAV_ITEMS.filter((item) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useHasPermission(item.permission);
  });
};

/** One sidebar line: a lone page, or a group standing for its pages. */
export interface SidebarEntry {
  key: string;
  label: string;
  /** The page, or the first page of the group this user may see. */
  href: string;
  description?: string;
  /** Every route the entry stands for, so it stays lit on any of them. */
  hrefs: string[];
}

/**
 * The sidebar, with each group folded into one entry at its first member's
 * place. A group this user can see only one page of is shown as that page,
 * under its own name, since a one-tab group would only hide what it is.
 */
export const useSidebarEntries = (): SidebarEntry[] => {
  const items = useAccessibleNavItems();
  const entries: SidebarEntry[] = [];
  const seen = new Set<NavGroupKey>();

  for (const item of items) {
    if (item.group && seen.has(item.group)) continue;

    const members = item.group
      ? items.filter((other) => other.group === item.group)
      : [item];

    if (item.group) seen.add(item.group);

    entries.push(
      members.length > 1 && item.group
        ? {
            key: `group:${item.group}`,
            label: NAV_GROUPS[item.group].label,
            href: members[0].href,
            description: NAV_GROUPS[item.group].description,
            hrefs: members.map((member) => member.href),
          }
        : {
            key: item.href,
            label: item.label,
            href: item.href,
            description: item.description,
            hrefs: [item.href],
          },
    );
  }

  return entries;
};

/**
 * The entry to light for a route: the one with a page that is the longest
 * prefix of it, so /facilities/ranking and /facilities/42 both resolve to
 * Facilities, and /finance/payments does not light Finance Approval.
 */
export const activeEntryKey = (
  entries: SidebarEntry[],
  pathname: string,
): string | undefined => {
  let best: { key: string; length: number } | undefined;

  for (const entry of entries) {
    for (const href of entry.hrefs) {
      const matches = pathname === href || pathname.startsWith(`${href}/`);
      if (matches && (!best || href.length > best.length)) {
        best = { key: entry.key, length: href.length };
      }
    }
  }

  return best?.key;
};

/**
 * The tabs for the page at exactly this route, or none. Only a group's list
 * pages get the bar: a detail page beneath one (/facilities/42) is a place of
 * its own, and a bar there would point at lists it is not one of.
 */
export const useSectionTabs = (
  pathname: string,
): { label: string; href: string }[] => {
  const items = useAccessibleNavItems();
  const current = items.find((item) => item.href === pathname);
  if (!current?.group) return [];

  const members = items.filter((item) => item.group === current.group);
  if (members.length < 2) return [];

  return members.map((item) => ({
    label: item.tabLabel ?? item.label,
    href: item.href,
  }));
};

/**
 * True when this account may not open the page at this route.
 *
 * The sidebar hides what a role cannot use, but a bookmark, a shared link or
 * a typed URL still reaches the page, which then fires calls the account is
 * refused — a vendor opening /facilities/ranking got three 403s and an error
 * card. The route is matched to its sidebar page by the longest prefix, the
 * same way the sidebar lights its entry, and judged by that page's
 * permission. Routes no sidebar page covers (detail pages such as
 * /bookings/42) are left alone.
 *
 * Only the role-scoped accounts are judged. Their surface is fixed and known;
 * other roles reach some pages by links outside the sidebar, and this is not
 * the place to find out which.
 */
export const useRouteBlocked = (pathname: string): boolean => {
  const role = useUserRole();
  const granted = useUserPermissions();
  if (!isScopedRole(role)) return false;

  let best: NavItem | undefined;
  for (const item of NAV_ITEMS) {
    const matches =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    if (matches && (!best || item.href.length > best.href.length)) {
      best = item;
    }
  }
  return !!best && !granted.includes(best.permission);
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
  const actions = Object.values(ROLE_QUICK_ACTIONS).filter((action) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useHasPermission(action.permission);
  });

  return actions;
};
