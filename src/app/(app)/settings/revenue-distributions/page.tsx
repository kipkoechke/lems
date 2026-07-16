"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import {
  useCreateRevenueDistribution,
  useRevenueDistributions,
  useUpdateRevenueDistribution,
} from "@/features/settings/useRevenueDistributions";
import {
  RevenueDistribution,
  RevenueDistributionCreateRequest,
} from "@/services/apiRevenueDistributions";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import { InputField } from "@/components/common/InputField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaEdit, FaPercent, FaPlus, FaTimes } from "react-icons/fa";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function RevenueDistributionsContent() {
  const { distributions, isLoading, error, refetch } = useRevenueDistributions();
  const { createDistribution, isCreating } = useCreateRevenueDistribution();
  const { updateDistribution, isUpdating } = useUpdateRevenueDistribution();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RevenueDistribution | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RevenueDistributionCreateRequest>({
    defaultValues: {
      vendor_percentage: 60,
      facility_percentage: 40,
      active: true,
    },
  });

  const vendorPct = Number(watch("vendor_percentage") ?? 0);
  const facilityPct = Number(watch("facility_percentage") ?? 0);
  const total = vendorPct + facilityPct;
  const totalValid = total === 100;

  const openCreate = () => {
    setEditing(null);
    reset({
      vendor_percentage: 60,
      facility_percentage: 40,
      start_date: "",
      end_date: "",
      active: true,
    });
    setShowModal(true);
  };

  const openEdit = (distribution: RevenueDistribution) => {
    setEditing(distribution);
    reset({
      vendor_percentage: distribution.vendor_percentage,
      facility_percentage: distribution.facility_percentage,
      start_date: distribution.start_date?.split("T")[0] ?? "",
      end_date: distribution.end_date?.split("T")[0] ?? "",
      active: distribution.active,
    });
    setShowModal(true);
  };

  const onSubmit = (data: RevenueDistributionCreateRequest) => {
    const payload = {
      ...data,
      vendor_percentage: Number(data.vendor_percentage),
      facility_percentage: Number(data.facility_percentage),
    };

    if (editing) {
      updateDistribution(
        { distributionId: editing.id, data: payload },
        { onSuccess: () => setShowModal(false) },
      );
    } else {
      createDistribution(payload, { onSuccess: () => setShowModal(false) });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            {[...Array(4)].map((_, i) => (
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
        title="Unable to Load Revenue Distributions"
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
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FaPercent className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Revenue Distributions
                </h1>
                <p className="text-sm text-slate-500">
                  Vendor / facility revenue share periods
                </p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="lg:ml-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <FaPlus className="w-3 h-3" /> Add Distribution
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Vendor Share</Table.HeaderCell>
                <Table.HeaderCell>Facility Share</Table.HeaderCell>
                <Table.HeaderCell>Start Date</Table.HeaderCell>
                <Table.HeaderCell>End Date</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {distributions.length === 0 ? (
                <Table.Empty colSpan={6}>
                  No revenue distribution periods defined yet.
                </Table.Empty>
              ) : (
                distributions.map((d) => (
                  <Table.Row key={d.id}>
                    <Table.Cell>
                      <span className="text-sm font-medium text-slate-900">
                        {d.vendor_percentage}%
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm font-medium text-slate-900">
                        {d.facility_percentage}%
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {formatDate(d.start_date)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {formatDate(d.end_date)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          d.active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {d.active ? "Active" : "Inactive"}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`distribution-${d.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item onClick={() => openEdit(d)}>
                            <FaEdit className="text-amber-500" /> Edit
                          </ActionMenu.Item>
                        </ActionMenu.Content>
                      </ActionMenu>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editing ? "Edit Distribution" : "Add Distribution"}
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
                    label="Vendor Percentage"
                    type="number"
                    placeholder="e.g. 60"
                    register={register("vendor_percentage", {
                      required: "Vendor percentage is required",
                      min: { value: 0, message: "Must be 0 or more" },
                      max: { value: 100, message: "Must be 100 or less" },
                    })}
                    error={errors.vendor_percentage?.message}
                    required
                  />
                  <InputField
                    label="Facility Percentage"
                    type="number"
                    placeholder="e.g. 40"
                    register={register("facility_percentage", {
                      required: "Facility percentage is required",
                      min: { value: 0, message: "Must be 0 or more" },
                      max: { value: 100, message: "Must be 100 or less" },
                    })}
                    error={errors.facility_percentage?.message}
                    required
                  />
                </div>

                {/* The two shares must account for the whole tariff. */}
                <div
                  className={`text-sm rounded-lg px-3 py-2 ${
                    totalValid
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  Total: {total}%{" "}
                  {totalValid ? "— splits the full tariff" : "— must equal 100%"}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Start Date"
                    type="date"
                    placeholder=""
                    register={register("start_date", {
                      required: "Start date is required",
                    })}
                    error={errors.start_date?.message}
                    required
                  />
                  <InputField
                    label="End Date"
                    type="date"
                    placeholder=""
                    register={register("end_date", {
                      required: "End date is required",
                    })}
                    error={errors.end_date?.message}
                    required
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    {...register("active")}
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
                    disabled={isCreating || isUpdating || !totalValid}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editing
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RevenueDistributionsPage() {
  return (
    <PermissionGate permission={Permission.MANAGE_REVENUE_DISTRIBUTIONS}>
      <RevenueDistributionsContent />
    </PermissionGate>
  );
}
