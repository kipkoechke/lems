"use client";

import { useParams, useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useUser } from "@/features/users/useUsers";
import { useUserPermissions } from "@/features/users/usePermissionsAdmin";
import { ErrorState } from "@/components/common/ErrorState";
import { FaArrowLeft, FaEdit, FaKey } from "react-icons/fa";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function UserDetailContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { user, isLoading, error } = useUser(userId);
  const { permissions } = useUserPermissions(userId);

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <ErrorState
        title="Unable to Load User"
        error={error}
        message={!error && !user ? "User not found" : undefined}
        action={{ label: "Back to Users", onClick: () => router.push("/users") }}
        fullScreen
      />
    );
  }

  const scope = user.is_superuser
    ? "Super Admin"
    : user.is_vendor
      ? "Vendor User"
      : user.is_facility
        ? "Facility User"
        : "Standard";

  const details = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    { label: "Full Name", value: user.full_name },
    { label: "Scope", value: scope },
    { label: "Facility ID", value: user.facility_id },
    { label: "Vendor ID", value: user.vendor_id },
  ];

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {user.full_name || user.username}
            </h1>
            <p className="text-sm text-slate-500 font-mono">{user.email}</p>
          </div>
          <span
            className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              user.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => router.push(`/users/${userId}/permissions`)}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaKey className="w-3.5 h-3.5" /> Permissions
          </button>
          <button
            onClick={() => router.push(`/users/${userId}/edit`)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaEdit className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {details.map((d) => (
              <div key={d.label}>
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="text-sm font-medium text-slate-900 break-words">
                  {d.value || "-"}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Created: {formatDate(user.created_at)}</span>
            <span>Updated: {formatDate(user.updated_at)}</span>
          </div>
        </div>

        {/* Assigned permissions */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Assigned Permissions ({permissions.length})
          </h2>
          {permissions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No permissions assigned to this user yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {permissions.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200"
                  title={p.description ?? undefined}
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <PermissionGate permission={Permission.CREATE_FACILITY_USERS}>
      <UserDetailContent />
    </PermissionGate>
  );
}
