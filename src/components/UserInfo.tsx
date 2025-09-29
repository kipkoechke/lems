"use client";

import { useCurrentUser, useCurrentFacility } from "@/hooks/useAuth";

export default function UserInfo() {
  const user = useCurrentUser();
  const facility = useCurrentFacility();

  if (!user) {
    return <div className="p-4 text-gray-500">No user logged in</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-lg mb-3">Current User Info</h3>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role}</p>
        {facility && (
          <div className="mt-4">
            <h4 className="font-medium">Facility:</h4>
            <p><strong>Code:</strong> {facility.code || "Not assigned"}</p>
            <p><strong>Name:</strong> {facility.name || "Not assigned"}</p>
          </div>
        )}
      </div>
    </div>
  );
}