"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useUser } from "@/features/users/useUsers";
import {
  useAssignUserPermission,
  usePermissionsCatalog,
  useUnassignUserPermission,
  useUserPermissions,
} from "@/features/users/usePermissionsAdmin";
import { useCurrentUser } from "@/hooks/useAuth";
import { SearchField } from "@/components/common/SearchField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaArrowLeft, FaCheck, FaPlus, FaTimes } from "react-icons/fa";

function UserPermissionsContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const currentUser = useCurrentUser();

  const [search, setSearch] = useState("");

  const { user, isLoading: userLoading } = useUser(userId);
  const {
    permissions: assigned,
    isLoading: assignedLoading,
    error,
    refetch,
  } = useUserPermissions(userId);
  const { permissions: catalog, isLoading: catalogLoading } =
    usePermissionsCatalog({ is_active: true, page_size: 100 });

  const { assignPermission, isAssigning } = useAssignUserPermission(userId);
  const { unassignPermission, isUnassigning } =
    useUnassignUserPermission(userId);

  const assignedIds = useMemo(
    () => new Set(assigned.map((p) => p.id)),
    [assigned],
  );

  // Group the catalog by resource so a long flat list stays navigable.
  const grouped = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = catalog.filter(
      (p) =>
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.resource.toLowerCase().includes(term),
    );

    return filtered.reduce<Record<string, typeof catalog>>((acc, p) => {
      const key = p.resource || "other";
      (acc[key] ||= []).push(p);
      return acc;
    }, {});
  }, [catalog, search]);

  const isLoading = userLoading || assignedLoading || catalogLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Permissions"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  const busy = isAssigning || isUnassigning;

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
              Permissions
            </h1>
            <p className="text-sm text-slate-500">
              {user?.full_name || user?.username} · {assigned.length} assigned
            </p>
          </div>
          <div className="flex-1 min-w-[200px] max-w-md ml-auto">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search permissions..."
            />
          </div>
        </div>

        {/* Catalog grouped by resource */}
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
            {search
              ? "No permissions match your search"
              : "No permissions have been defined yet."}
          </div>
        ) : (
          Object.entries(grouped).map(([resource, perms]) => (
            <div
              key={resource}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {resource}
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {perms.map((p) => {
                  const isAssigned = assignedIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {p.name}
                          </p>
                          <span className="text-xs text-slate-400 font-mono">
                            {p.action}
                          </span>
                        </div>
                        {p.description && (
                          <p className="text-xs text-slate-500 truncate">
                            {p.description}
                          </p>
                        )}
                      </div>

                      {isAssigned ? (
                        <button
                          onClick={() => unassignPermission(p.id)}
                          disabled={busy}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors disabled:opacity-50 group"
                        >
                          <FaCheck className="w-3 h-3 group-hover:hidden" />
                          <FaTimes className="w-3 h-3 hidden group-hover:block" />
                          <span className="group-hover:hidden">Assigned</span>
                          <span className="hidden group-hover:inline">
                            Remove
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            assignPermission({
                              permissionId: p.id,
                              grantedBy: currentUser?.id,
                            })
                          }
                          disabled={busy}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors disabled:opacity-50"
                        >
                          <FaPlus className="w-3 h-3" /> Assign
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function UserPermissionsPage() {
  return (
    <PermissionGate permission={Permission.CREATE_FACILITY_USERS}>
      <UserPermissionsContent />
    </PermissionGate>
  );
}
