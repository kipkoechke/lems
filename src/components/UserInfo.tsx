"use client";

import { useCurrentUser, useCurrentFacility } from "@/hooks/useAuth";
import { useUserRole, useUserPermissions } from "@/hooks/usePermissions";
import { getRoleDisplayName } from "@/lib/rbac";
import { useEffect } from "react";

export default function UserInfo() {
  const user = useCurrentUser();
  const facility = useCurrentFacility();
  const role = useUserRole();
  const permissions = useUserPermissions();

  // Log user info and permissions to console
  useEffect(() => {
    if (user) {
      console.group("🔐 Current User Information");
      console.log("👤 User Details:", {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleDisplayName: role ? getRoleDisplayName(role) : "Unknown",
      });

      if (facility) {
        console.log("🏥 Facility:", {
          code: facility.code || "Not assigned",
          name: facility.name || "Not assigned",
        });
      }

      console.log(`🔑 Permissions (${permissions.length}):`, permissions);
      console.groupEnd();
    } else {
      console.log("❌ No user logged in");
    }
  }, [user, facility, role, permissions]);

  // Return null to remove the UI completely
  return null;
}
