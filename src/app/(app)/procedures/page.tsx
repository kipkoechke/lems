"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchControl } from "@/hooks/useSearchControl";
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
  procedureAmount,
  procedureCode,
  procedureStateLabel,
} from "@/services/apiProcedures";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { SearchField } from "@/components/common/SearchField";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { ErrorState } from "@/components/common/ErrorState";
import { FaEdit, FaPlus, FaStethoscope, FaTimes, FaTrash } from "react-icons/fa";

const LIFECYCLE_BADGE: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-slate-100 text-slate-700",
  suspended: "bg-amber-100 text-amber-800",
  retired: "bg-red-100 text-red-800",
};

const STATE_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/** Amounts arrive as decimal strings (e.g. "61600.00"). */
const formatAmount = (value?: number, currency = "KES") =>
  value === undefined ? "-" : `${currency} ${value.toLocaleString("en-KE")}`;

function ProceduresContent() {
  const [page, setPage] = useState(1);
  const [lifecycle, setLifecycle] = useState("");
  const search = useSearchControl(() => setPage(1));
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Procedure | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { procedures, pagination, isLoading, error, refetch } = useProcedures({
    // Searching is unpaginated so results span the whole catalogue rather than
    // being capped at one page of matches.
    ...(search.isSearching ? {} : { page, page_size: 20 }),
    search: search.term || undefined,
    is_active: lifecycle ? lifecycle === "active" : undefined,
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
      code: "",
      name: "",
      modality: "",
      description: "",
      tariff: 0,
      vendor_share: 0,
      facility_share: 0,
      capitated: false,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (procedure: Procedure) => {
    setEditing(procedure);
    reset({
      code: procedureCode(procedure) === "-" ? "" : procedureCode(procedure),
      name: procedure.name,
      modality: procedure.modality ?? "",
      description: procedure.description ?? "",
      tariff: procedureAmount(procedure) ?? 0,
      vendor_share: Number(procedure.vendor_share ?? 0),
      facility_share: Number(procedure.facility_share ?? 0),
      capitated: procedure.capitated ?? false,
      is_active: procedure.is_active ?? true,
    });
    setShowModal(true);
  };

  const onSubmit = (data: ProcedureCreateRequest) => {
    const payload = {
      ...data,
      tariff: Number(data.tariff),
      vendor_share: Number(data.vendor_share ?? 0),
      facility_share: Number(data.facility_share ?? 0),
      modality: data.modality || undefined,
      description: data.description || undefined,
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
                value={search.input}
                onChange={search.onInputChange}
                onSearch={search.submit}
                onClear={search.clear}
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
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Procedure</Table.HeaderCell>
                <Table.HeaderCell>Modality</Table.HeaderCell>
                <Table.HeaderCell>Tariff</Table.HeaderCell>
                <Table.HeaderCell>Vendor Share</Table.HeaderCell>
                <Table.HeaderCell>Facility Share</Table.HeaderCell>
                <Table.HeaderCell>
                  <ColumnFilter
                    label="State"
                    options={STATE_OPTIONS}
                    value={lifecycle}
                    onChange={(v) => {
                      setLifecycle(v);
                      setPage(1);
                    }}
                    allLabel="All States"
                    searchable={false}
                  />
                </Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {procedures.length === 0 ? (
                <Table.Empty colSpan={7}>
                  {search.isSearching || lifecycle
                    ? "No procedures match your criteria"
                    : "No procedures defined yet."}
                </Table.Empty>
              ) : (
                procedures.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        {procedureCode(p)}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {p.modality || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-medium text-slate-900">
                        {formatAmount(procedureAmount(p), p.currency)}
                      </span>
                      {p.capitated && (
                        <div className="text-xs text-slate-500">Capitated</div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {formatAmount(
                          p.vendor_share === undefined
                            ? undefined
                            : Number(p.vendor_share),
                          p.currency,
                        )}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {formatAmount(
                          p.facility_share === undefined
                            ? undefined
                            : Number(p.facility_share),
                          p.currency,
                        )}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          LIFECYCLE_BADGE[procedureStateLabel(p)] ??
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {procedureStateLabel(p)}
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

          {!search.isSearching && pagination && pagination.last_page > 1 && (
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
                    label="SHA Code"
                    type="text"
                    placeholder="e.g. SHA-19-195"
                    register={register("code", {
                      required: "SHA code is required",
                    })}
                    error={errors.code?.message}
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
                    label="Modality"
                    type="text"
                    placeholder="e.g. XA"
                    register={register("modality")}
                  />
                  <InputField
                    label="Tariff (KES)"
                    type="number"
                    placeholder="e.g. 3500"
                    register={register("tariff", {
                      required: "Tariff is required",
                      min: { value: 0, message: "Must be 0 or more" },
                    })}
                    error={errors.tariff?.message}
                    required
                  />
                  <InputField
                    label="Vendor Share (KES)"
                    type="number"
                    placeholder="e.g. 3300"
                    register={register("vendor_share", {
                      min: { value: 0, message: "Must be 0 or more" },
                    })}
                    error={errors.vendor_share?.message}
                  />
                  <InputField
                    label="Facility Share (KES)"
                    type="number"
                    placeholder="e.g. 200"
                    register={register("facility_share", {
                      min: { value: 0, message: "Must be 0 or more" },
                    })}
                    error={errors.facility_share?.message}
                  />
                  <SelectField
                    label="State"
                    register={register("is_active", {
                      setValueAs: (v) => v === "true" || v === true,
                    })}
                    placeholder="Select state"
                    options={[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    {...register("capitated")}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  Capitated (paid per member, not per procedure)
                </label>

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
