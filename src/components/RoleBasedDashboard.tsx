"use client";

import { useUserRole } from "@/hooks/usePermissions";
import { UserRole, Permission } from "@/lib/rbac";
import { useAccessibleQuickActions } from "@/lib/navigation";
import {
  PermissionGate,
  AdminGate,
  MedicalStaffGate,
  FinanceStaffGate,
} from "./PermissionGate";

// Quick action button component
interface QuickActionButtonProps {
  label: string;
  href: string;
  className: string;
  onClick?: () => void;
}

const QuickActionButton = ({
  label,
  href,
  className,
}: QuickActionButtonProps) => (
  <a
    href={href}
    className={`${className} text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200`}
  >
    {label}
  </a>
);

// Dashboard widget components
const AdminDashboard = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">System Administration</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800">Facilities</h4>
          <p className="text-blue-600 text-sm">Manage healthcare facilities</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800">Users</h4>
          <p className="text-green-600 text-sm">Create and manage users</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800">Vendors</h4>
          <p className="text-purple-600 text-sm">Onboard equipment vendors</p>
        </div>
      </div>
    </div>
  </div>
);

const MedicalDashboard = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Patient Care Workflow</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-teal-50 p-4 rounded-lg">
          <h4 className="font-medium text-teal-800">Patient Registration</h4>
          <p className="text-teal-600 text-sm">Get patients from registry</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-medium text-indigo-800">Service Selection</h4>
          <p className="text-indigo-600 text-sm">Select and book services</p>
        </div>
      </div>
    </div>
  </div>
);

const FinanceDashboard = () => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Financial Operations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800">SHA Eligibility</h4>
          <p className="text-yellow-600 text-sm">Check patient eligibility</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-medium text-orange-800">Patient Queue</h4>
          <p className="text-orange-600 text-sm">Manage payment queue</p>
        </div>
      </div>
    </div>
  </div>
);

// Main role-based dashboard component
export const RoleBasedDashboard = () => {
  const role = useUserRole();
  const quickActions = useAccessibleQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome message based on role */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome to LEMS</h2>
        <p className="text-blue-100">
          {role === UserRole.ADMIN &&
            "Manage system facilities, vendors, and equipment"}
          {role === UserRole.F_MEDICAL &&
            "Handle patient registration and service selection"}
          {role === UserRole.F_FINANCE &&
            "Process payments and manage patient eligibility"}
          {(!role || role === UserRole.USER) &&
            "Access your healthcare management dashboard"}
        </p>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <QuickActionButton
                key={action.label}
                label={action.label}
                href={action.href}
                className={action.className}
              />
            ))}
          </div>
        </div>
      )}

      {/* Role-specific dashboard widgets */}
      <AdminGate>
        <AdminDashboard />
      </AdminGate>

      <MedicalStaffGate>
        <MedicalDashboard />
      </MedicalStaffGate>

      <FinanceStaffGate>
        <FinanceDashboard />
      </FinanceStaffGate>

      {/* Common widgets for all users */}
      <PermissionGate permission={Permission.VIEW_PATIENTS}>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-gray-600">
            Your recent patient and booking activities will appear here.
          </p>
        </div>
      </PermissionGate>
    </div>
  );
};
