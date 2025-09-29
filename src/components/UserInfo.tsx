"use client";

import { useCurrentUser, useCurrentFacility } from "@/hooks/useAuth";
import { useUserRole, useUserPermissions } from "@/hooks/usePermissions";
import { getRoleDisplayName } from "@/lib/rbac";

export default function UserInfo() {
  const user = useCurrentUser();
  const facility = useCurrentFacility();
  const role = useUserRole();
  const permissions = useUserPermissions();

  if (!user) {
    return <div className="p-4 text-gray-500">No user logged in</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Current User Info</h3>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
        <p>
          <strong>Role:</strong> {user.role} (
          {role ? getRoleDisplayName(role) : "Unknown"})
        </p>

        {facility && (
          <div className="mt-4">
            <h4 className="font-medium">Facility:</h4>
            <p>
              <strong>Code:</strong> {facility.code || "Not assigned"}
            </p>
            <p>
              <strong>Name:</strong> {facility.name || "Not assigned"}
            </p>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium">Permissions ({permissions.length}):</h4>
          <div className="mt-2 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-1 gap-1 text-xs">
              {permissions.map((permission) => (
                <span
                  key={permission}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {permission.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
