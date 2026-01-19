"use client";

import { useAccessibleQuickActions } from "@/lib/navigation";
import { useCurrentUser } from "@/hooks/useAuth";
import VendorDashboard from "./VendorDashboard";

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

// Simplified dashboard component with only quick actions
export const RoleBasedDashboard = () => {
  const user = useCurrentUser();
  const quickActions = useAccessibleQuickActions();

  // Show vendor dashboard for vendor users
  if (user?.role === "vendor") {
    return <VendorDashboard />;
  }

  return (
    <div className="space-y-6">
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
    </div>
  );
};
