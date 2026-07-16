"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useCreateProcedure,
  useDeleteProcedure,
  useProcedures,
  useUpdateProcedure,
} from "@/features/procedures/useProcedures";
import {
  Procedure,
  ProcedureCreateRequest,
  PROCEDURE_LIFECYCLE_OPTIONS,
} from "@/services/apiProcedures";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { SearchField } from "@/components/common/SearchField";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { ErrorState } from "@/components/common/ErrorState";
import { FaEdit, FaPlus, FaStethoscope, FaTimes, FaTrash } from "react-icons/fa";

const LIFECYCLE_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-amber-100 text-amber-800",
  retired: "bg-red-100 text-red-800",
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatAmount = (value: number | string, currency = "KES") =>
  `${currency} ${Number(value).toLocaleString()}`;

function ProceduresContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { procedures, pagination, isLoading, error, refetch } = useProcedures({
    page,
    page_size: 20,
    search: search || undefined,
    lifecycle_state: lifecycle || undefined,
  });

  const { createProcedure, isCreating } = useCreateProcedure();
  const { updateProcedure, isUpdating } = useUpdateProcedure();
  const { deleteProcedure, isDeleting } = useDeleteProcedure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProcedureCreateRequest>();

  const openCreate = () => {
    setEditing(null);
    reset({
      procedure_code: "",
      name: "",
      category: "",
      procedure_type: "",
      description: "",
      reimbursement_amount: 0,
      currency: "KES",
      effective_from: "",
      effective_to: "",
      lifecycle_state: "active",
    });
    setShowModal(true);
  };

  const openEdit = (procedure: Procedure) => {
    setEditing(procedure);
    reset({
      procedure_code: procedure.procedure_code,
      name: procedure.name,
      category: procedure.category ?? "",
      procedure_type: procedure.procedure_type ?? "",
      description: procedure.description ?? "",
      reimbursement_amount: Number(procedure.reimbursement_amount),
      currency: procedure.currency ?? "KES",
      effective_from: procedure.effective_from?.split("T")[0] ?? "",
      effective_to: procedure.effective_to?.split("T")[0] ?? "",
      lifecycle_state: procedure.lifecycle_state,
    });
    setShowModal(true);
  };

  const onSubmit = (data: ProcedureCreateRequest) => {
    const payload = {
      ...data,
      reimbursement_amount: Number(data.reimbursement_amount),
      category: data.category || undefined,
      procedure_type: data.procedure_type || undefined,
      description: data.description || undefined,
      effective_to: data.effective_to || undefined,
    };

    if (editing) {
      updateProcedure(
        { procedureId: editing.id, data: payload },
        { onSuccess: () => setShowModal(false) },
      );
    } else {
      createProcedure(payload, { onSuccess: () => setShowModal(false) });
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
        title="Unable to Load Procedures"
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
                <FaStethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  SHA Procedures
                </h1>
                <p className="text-sm text-slate-500">
                  {pagination?.total ?? procedures.length} procedures
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
                placeholder="Search by name, code or category..."
              />
            </div>

            <button
              onClick={openCreate}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" /> Add Procedure
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 border-b border-slate-100">
            <div className="w-full sm:w-48">
              <SearchableSelect
                label="Lifecycle State"
                options={PROCEDURE_LIFECYCLE_OPTIONS}
                value={lifecycle}
                onChange={(v) => {
                  setLifecycle(v);
                  setPage(1);
                }}
                placeholder="All States"
                searchPlaceholder="Search state..."
              />
            </div>
          </div>

          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Procedure</Table.HeaderCell>
                <Table.HeaderCell>Category</Table.HeaderCell>
                <Table.HeaderCell>Reimbursement</Table.HeaderCell>
                <Table.HeaderCell>Effective From</Table.HeaderCell>
                <Table.HeaderCell>State</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {procedures.length === 0 ? (
                <Table.Empty colSpan={6}>
                  {search || lifecycle
                    ? "No procedures match your criteria"
                    : "No procedures defined yet."}
                </Table.Empty>
              ) : (
                procedures.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {p.procedure_code}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {p.category || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-medium text-slate-900">
                        {formatAmount(p.reimbursement_amount, p.currency)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {formatDate(p.effective_from)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          LIFECYCLE_BADGE[p.lifecycle_state] ??
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.lifecycle_state}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`procedure-${p.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item onClick={() => openEdit(p)}>
                            <FaEdit className="text-amber-500" /> Edit
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() => setConfirmDelete(p.id)}
                          >
                            <FaTrash className="text-red-500" /> Retire
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
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editing ? "Edit Procedure" : "Add New Procedure"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Procedure Code"
                    type="text"
                    placeholder="e.g. XRAY-CHEST-PA"
                    register={register("procedure_code", {
                      required: "Procedure code is required",
                    })}
                    error={errors.procedure_code?.message}
                    required
                    disabled={!!editing}
                  />
                  <InputField
                    label="Name"
                    type="text"
                    placeholder="e.g. Chest X-Ray PA"
                    register={register("name", { required: "Name is required" })}
                    error={errors.name?.message}
                    required
                  />
                  <InputField
                    label="Category"
                    type="text"
                    placeholder="e.g. Radiology"
                    register={register("category")}
                  />
                  <InputField
                    label="Procedure Type"
                    type="text"
                    placeholder="e.g. Diagnostic"
                    register={register("procedure_type")}
                  />
                  <InputField
                    label="Reimbursement Amount"
                    type="number"
                    placeholder="e.g. 3500"
                    register={register("reimbursement_amount", {
                      required: "Reimbursement amount is required",
                      min: { value: 0, message: "Must be 0 or more" },
                    })}
                    error={errors.reimbursement_amount?.message}
                    required
                  />
                  <InputField
                    label="Currency"
                    type="text"
                    placeholder="KES"
                    register={register("currency")}
                  />
                  <InputField
                    label="Effective From"
                    type="date"
                    placeholder=""
                    register={register("effective_from", {
                      required: "Effective from is required",
                    })}
                    error={errors.effective_from?.message}
                    required
                  />
                  <InputField
                    label="Effective To"
                    type="date"
                    placeholder=""
                    register={register("effective_to")}
                  />
                  <SelectField
                    label="Lifecycle State"
                    register={register("lifecycle_state")}
                    placeholder="Select state"
                    options={PROCEDURE_LIFECYCLE_OPTIONS}
                  />
                </div>

                <InputField
                  label="Description"
                  type="text"
                  placeholder="Optional description"
                  register={register("description")}
                />

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
                        ? "Update Procedure"
                        : "Create Procedure"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Retire confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Retire Procedure
            </h3>
            <p className="text-gray-600 mb-6">
              This marks the procedure as retired. It will no longer be
              available for new bookings.
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
                  deleteProcedure(confirmDelete, {
                    onSuccess: () => setConfirmDelete(null),
                  })
                }
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Retiring..." : "Retire"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProceduresPage() {
  return (
    <PermissionGate permission={Permission.ONBOARD_SERVICES}>
      <ProceduresContent />
    </PermissionGate>
  );
}
