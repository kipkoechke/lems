"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import {
  useUpdateVendorEquipment,
  useVendorEquipment,
} from "@/features/vendors/useVendorEquipments";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_STATUS_OPTIONS,
} from "@/features/vendors/equipmentOptions";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import BackButton from "@/components/common/BackButton";
import { ErrorState } from "@/components/common/ErrorState";

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  serial_number: z.string().optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  manufacture_date: z.string().optional(),
  description: z.string().optional(),
  status: z.enum([
    "active",
    "inactive",
    "maintenance",
    "decommissioned",
    "pending_installation",
  ]),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

function EditMyEquipmentContent({ equipmentId }: { equipmentId: string }) {
  const router = useRouter();
  const { vendorId } = useMyVendor();
  const {
    data: equipment,
    isLoading,
    error,
    refetch,
  } = useVendorEquipment(vendorId, equipmentId);
  const updateMutation = useUpdateVendorEquipment();

  const [specifications, setSpecifications] = useState<Record<string, string>>(
    {},
  );
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormData>({ resolver: zodResolver(equipmentSchema) });

  useEffect(() => {
    if (!equipment) return;
    reset({
      name: equipment.name ?? "",
      category: equipment.category ?? "",
      serial_number: equipment.serial_number ?? "",
      model: equipment.model ?? "",
      brand: equipment.brand ?? "",
      manufacture_date: equipment.manufacture_date ?? "",
      description: equipment.description ?? "",
      status: (equipment.status as EquipmentFormData["status"]) ?? "active",
    });
    if (equipment.specifications) {
      setSpecifications(
        Object.fromEntries(
          Object.entries(equipment.specifications).map(([k, v]) => [
            k,
            String(v),
          ]),
        ),
      );
    }
  }, [equipment, reset]);

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setSpecifications((prev) => ({
        ...prev,
        [newSpecKey.trim()]: newSpecValue.trim(),
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    setSpecifications((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const onSubmit = (data: EquipmentFormData) => {
    updateMutation.mutate(
      {
        vendorId,
        equipmentId,
        data: {
          ...data,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : undefined,
        },
      },
      { onSuccess: () => router.push(`/vendor/equipments/${equipmentId}`) },
    );
  };

  if (isLoading) {
    return (
      <div className="px-4 py-4">
        <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-5 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <ErrorState
        title="Unable to Load Equipment"
        error={error}
        message={
          !error && !equipment ? "This equipment could not be found." : undefined
        }
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <BackButton
          onClick={() => router.push(`/vendor/equipments/${equipmentId}`)}
        />
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">
            Edit Equipment
          </h1>
          <p className="text-sm text-slate-500 font-mono">{equipment.code}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Equipment Name"
              type="text"
              placeholder="Enter equipment name"
              register={register("name")}
              error={errors.name?.message}
              required
            />
            <SelectField
              label="Category"
              register={register("category")}
              error={errors.category?.message}
              required
              placeholder="Select Category"
              options={EQUIPMENT_CATEGORIES}
            />
            <InputField
              label="Serial Number"
              type="text"
              placeholder="Enter serial number"
              register={register("serial_number")}
              error={errors.serial_number?.message}
            />
            <InputField
              label="Model"
              type="text"
              placeholder="Enter model"
              register={register("model")}
              error={errors.model?.message}
            />
            <InputField
              label="Brand"
              type="text"
              placeholder="Enter brand"
              register={register("brand")}
              error={errors.brand?.message}
            />
            <InputField
              label="Manufacture Date"
              type="date"
              placeholder=""
              register={register("manufacture_date")}
              error={errors.manufacture_date?.message}
            />
            <SelectField
              label="Status"
              register={register("status")}
              error={errors.status?.message}
              placeholder="Select Status"
              options={EQUIPMENT_STATUS_OPTIONS}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter equipment description..."
            />
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Specifications
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              placeholder="Key (e.g., weight)"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              placeholder="Value (e.g., 500 kg)"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addSpecification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {Object.keys(specifications).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                >
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">{key}:</span>{" "}
                    <span className="text-slate-600">{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No specifications added yet.
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push(`/vendor/equipments/${equipmentId}`)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditMyEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_EQUIPMENTS}>
      <EditMyEquipmentContent equipmentId={id} />
    </PermissionGate>
  );
}
