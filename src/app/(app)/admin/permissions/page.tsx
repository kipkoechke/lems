"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useCreatePermission,
  useDeletePermission,
  usePermissionsCatalog,
  useUpdatePermission,
} from "@/features/users/usePermissionsAdmin";
import { PermissionRecord, PermissionCreateRequest } from "@/services/apiUsers";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { InputField } from "@/components/common/InputField";
import { SearchField } from "@/components/common/SearchField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaEdit, FaKey, FaPlus, FaTrash, FaTimes } from "react-icons/fa";

function PermissionsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PermissionRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { permissions, pagination, isLoading, error, refetch } =
    usePermissionsCatalog({
      page,
      page_size: 20,
      search: search || undefined,
    });

  const { createPermission, isCreating } = useCreatePermission();
  const { updatePermission, isUpdating } = useUpdatePermission();
  const { deletePermission, isDeleting } = useDeletePermission();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionCreateRequest>();

  const openCreate = () => {
    setEditing(null);
    reset({
      code: "",
      name: "",
      description: "",
      resource: "",
      action: "",
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (permission: PermissionRecord) => {
    setEditing(permission);
    reset({
      code: permission.code,
      name: permission.name,
      description: permission.description ?? "",
      resource: permission.resource,
      action: permission.action,
      is_active: permission.is_active,
    });
    setShowModal(true);
  };

  const onSubmit = (data: PermissionCreateRequest) => {
    if (editing) {
      // `code` is immutable once created — the update endpoint does not accept it.
      const { code: _code, ...updatable } = data;
      updatePermission(
        { permissionId: editing.id, data: updatable },
        { onSuccess: () => setShowModal(false) },
      );
    } else {
      createPermission(data, { onSuccess: () => setShowModal(false) });
    }
  };

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
        title="Unable to Load Permissions"
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
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaKey className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Permissions</h1>
                <p className="text-sm text-slate-500">
                  {pagination?.total ?? permissions.length} permissions defined
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
                placeholder="Search by name, code or resource..."
              />
            </div>

            <button
              onClick={openCreate}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" /> Add Permission
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Permission</Table.HeaderCell>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Resource</Table.HeaderCell>
                <Table.HeaderCell>Action</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {permissions.length === 0 ? (
                <Table.Empty colSpan={6}>
                  {search
                    ? "No permissions match your search"
                    : "No permissions defined yet."}
                </Table.Empty>
              ) : (
                permissions.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">{p.name}</div>
                      {p.description && (
                        <div className="text-xs text-slate-500">
                          {p.description}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {p.code}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {p.resource}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">{p.action}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          p.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`permission-${p.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item onClick={() => openEdit(p)}>
                            <FaEdit className="text-amber-500" /> Edit
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() => setConfirmDelete(p.id)}
                          >
                            <FaTrash className="text-red-500" /> Delete
                          </ActionMenu.Item>
                        </ActionMenu.Content>
                      </ActionMenu>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>

          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editing ? "Edit Permission" : "Add New Permission"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputField
                  label="Code"
                  type="text"
                  placeholder="e.g. bookings.create"
                  register={register("code", { required: "Code is required" })}
                  error={errors.code?.message}
                  required
                  disabled={!!editing}
                />

                <InputField
                  label="Name"
                  type="text"
                  placeholder="e.g. Create Bookings"
                  register={register("name", { required: "Name is required" })}
                  error={errors.name?.message}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Resource"
                    type="text"
                    placeholder="e.g. bookings"
                    register={register("resource", {
                      required: "Resource is required",
                    })}
                    error={errors.resource?.message}
                    required
                  />
                  <InputField
                    label="Action"
                    type="text"
                    placeholder="e.g. create"
                    register={register("action", {
                      required: "Action is required",
                    })}
                    error={errors.action?.message}
                    required
                  />
                </div>

                <InputField
                  label="Description"
                  type="text"
                  placeholder="What this permission allows"
                  register={register("description")}
                />

                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editing
                        ? "Update Permission"
                        : "Create Permission"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Delete Permission
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this permission? Any users holding
              it will lose the associated access.
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
                  deletePermission(confirmDelete, {
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

export default function PermissionsPage() {
  return (
    <PermissionGate permission={Permission.MANAGE_PERMISSIONS}>
      <PermissionsContent />
    </PermissionGate>
  );
}
