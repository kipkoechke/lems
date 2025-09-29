"use client";

import { useLogout, useCurrentUser } from "../hooks/useAuth";

export const LogoutButton = () => {
  const user = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">
        Welcome, {user.name || user.email}
      </span>
      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
      >
        {logoutMutation.isPending ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};
