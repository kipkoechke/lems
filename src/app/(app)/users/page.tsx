"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useDeleteUser, useUsers } from "@/features/users/useUsers";
import { userInstitution, userScopeLabel } from "@/services/apiUsers";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { ErrorState } from "@/components/common/ErrorState";
import { FaEdit, FaEye, FaPlus, FaTrash, FaUsers, FaKey } from "react-icons/fa";

const ACTIVE_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

function UsersContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { users, pagination, isLoading, error, refetch } = useUsers({
    page,
    page_size: 20,
    search: search || undefined,
    is_active: activeFilter ? activeFilter === "true" : undefined,
  });

  const { deleteUser, isDeleting } = useDeleteUser();

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Users"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 mb-2 md:mb-3 px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Users</h1>
                <p className="text-sm text-slate-500">
                  {pagination?.total ?? users.length} users
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-xl w-full mx-auto">
              <SearchField
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search by name, email or phone..."
              />
            </div>

            <button
              onClick={() => router.push("/users/new")}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" /> Add User
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>User</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Institution</Table.HeaderCell>
                <Table.HeaderCell>
                  <ColumnFilter
                    label="Status"
                    options={ACTIVE_OPTIONS}
                    value={activeFilter}
                    onChange={(v) => {
                      setActiveFilter(v);
                      setPage(1);
                    }}
                    allLabel="All Status"
                    searchable={false}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.length === 0 ? (
                <Table.Empty colSpan={6}>
                  {search || activeFilter
                    ? "No users match your criteria"
                    : "No users found. Create your first user to get started."}
                </Table.Empty>
              ) : (
                users.map((user) => {
                  const scope = userScopeLabel(user);
                  const institution = userInstitution(user);
                  return (
                    <Table.Row key={user.id}>
                      <Table.Cell>
                        <div className="font-medium text-slate-900">
                          {user.name || user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-slate-500 font-mono">
                            {user.phone}
                          </div>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-slate-700">
                          {user.email}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${scope.cls}`}
                        >
                          {scope.label}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {institution ? (
                          <>
                            <div className="text-sm text-slate-900">
                              {institution.name}
                            </div>
                            {institution.code && (
                              <div className="text-xs text-slate-500 font-mono">
                                {institution.code}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <ActionMenu menuId={`user-${user.id}`}>
                          <ActionMenu.Trigger />
                          <ActionMenu.Content>
                            <ActionMenu.Item
                              onClick={() => router.push(`/users/${user.id}`)}
                            >
                              <FaEye className="text-blue-500" /> View
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/users/${user.id}/edit`)
                              }
                            >
                              <FaEdit className="text-amber-500" /> Edit
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() =>
                                router.push(`/users/${user.id}/permissions`)
                              }
                            >
                              <FaKey className="text-purple-500" /> Permissions
                            </ActionMenu.Item>
                            <ActionMenu.Item
                              onClick={() => setConfirmDelete(user.id)}
                            >
                              <FaTrash className="text-red-500" /> Delete
                            </ActionMenu.Item>
                          </ActionMenu.Content>
                        </ActionMenu>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>

          {pagination &&
            (pagination.last_page || pagination.total_pages || 1) > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page ?? pagination.total_pages ?? 1}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                onPageChange={setPage}
              />
            )}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Delete User
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteUser(confirmDelete, {
                    onSuccess: () => setConfirmDelete(null),
                  })
                }
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <PermissionGate permission={Permission.CREATE_FACILITY_USERS}>
      <UsersContent />
    </PermissionGate>
  );
}
