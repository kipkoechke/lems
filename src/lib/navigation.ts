"use client";

import { Permission } from "@/lib/rbac";
import { useHasPermission } from "@/hooks/usePermissions";

export interface NavItem {
  label: string;
  href: string;
  permission: Permission;
  icon?: React.ReactNode;
  description?: string;
}

// Navigation items based on user roles and permissions
export const NAV_ITEMS: NavItem[] = [
  // Dashboard - available to all authenticated users
  {
    label: "Dashboard",
    href: "/",
    permission: Permission.VIEW_DASHBOARD,
    description: "Overview and quick actions",
  },

  // System Admin specific items
  {
    label: "Facilities",
    href: "/facilities",
    permission: Permission.VIEW_FACILITIES,
    description: "Manage healthcare facilities",
  },
  {
    label: "Vendors",
    href: "/vendors",
    permission: Permission.VIEW_VENDORS,
    description: "Manage equipment vendors",
  },
  {
    label: "Contracts",
    href: "/contracts",
    permission: Permission.VIEW_CONTRACTS,
    description: "Manage service contracts",
  },
  {
    label: "Equipment",
    href: "/equipments",
    permission: Permission.VIEW_EQUIPMENTS,
    description: "Manage medical equipment",
  },
  {
    label: "Lots",
    href: "/lots",
    permission: Permission.VIEW_LOTS,
    description: "Manage equipment lots",
  },

  // Patient workflow items (Medical and Finance staff)
  {
    label: "Patients",
    href: "/patients",
    permission: Permission.VIEW_PATIENTS,
    description: "Manage patient records",
  },
  {
    label: "Services",
    href: "/bookings",
    permission: Permission.VIEW_BOOKINGS,
    description: "Manage patient bookings",
  },
  {
    label: "Finance Approval",
    href: "/finance",
    permission: Permission.FINANCE_APPROVAL,
    description: "Approve pending bookings",
  },
  {
    label: "Sync to SHA",
    href: "/bookings/synced",
    permission: Permission.SYNC_TO_SHA,
    description: "Synchronize bookings to SHA",
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
  {
    label: "Trends",
    href: "/trends",
    permission: Permission.VIEW_TRENDS,
    description: "Analytics and trends",
  },
];

// Component to filter navigation items based on user permissions
export const useAccessibleNavItems = (): NavItem[] => {
  return NAV_ITEMS.filter((item) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useHasPermission(item.permission);
  });
};

// Role-specific quick actions
export const ROLE_QUICK_ACTIONS = {
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
