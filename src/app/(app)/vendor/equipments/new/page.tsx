"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import { useCreateVendorEquipment } from "@/features/vendors/useVendorEquipments";
import { EQUIPMENT_CATEGORIES } from "@/features/vendors/equipmentOptions";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import BackButton from "@/components/common/BackButton";

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  serial_number: z.string().optional(),
  model: z.string().optional(),
  brand: z.string().optional(),
  manufacture_date: z.string().optional(),
  description: z.string().optional(),
  ae_title: z.string().max(16).optional(),
  hl7_host: z.string().optional(),
  hl7_port: z.coerce.number().int().min(1).max(65535).optional().or(z.literal("")),
  dicom_port: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .optional()
    .or(z.literal("")),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

function NewMyEquipmentContent() {
  const router = useRouter();
  const { vendorId } = useMyVendor();
  const createEquipmentMutation = useCreateVendorEquipment();

  const [specifications, setSpecifications] = useState<Record<string, string>>(
    {},
  );
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EquipmentFormData>({ resolver: zodResolver(equipmentSchema) });

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
    createEquipmentMutation.mutate(
      {
        vendorId,
        data: {
          ...data,
          // New equipment is active by definition — sent for the vendor rather
          // than asked of them.
          status: "active",
          hl7_port: data.hl7_port || undefined,
          dicom_port: data.dicom_port || undefined,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : undefined,
        },
      },
      { onSuccess: () => router.push("/vendor/equipments") },
    );
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <BackButton onClick={() => router.push("/vendor/equipments")} />
        <h1 className="text-xl font-bold text-slate-900">Add New Equipment</h1>
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

        {/* DICOM Configuration */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">
            DICOM Configuration
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Optional — required only for imaging equipment that connects via
            DICOM/MWL. You can also set this later from the equipment page.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="AE Title"
              type="text"
              register={register("ae_title")}
              error={errors.ae_title?.message}
              placeholder="e.g. GEXR001 (max 16 chars)"
            />
            <InputField
              label="Device Host / IP"
              type="text"
              register={register("hl7_host")}
              placeholder="e.g. 192.168.1.50"
            />
            <InputField
              label="HL7 Port"
              type="number"
              register={register("hl7_port")}
              error={errors.hl7_port?.message}
              placeholder="e.g. 2575"
            />
            <InputField
              label="DICOM Port"
              type="number"
              register={register("dicom_port")}
              error={errors.dicom_port?.message}
              placeholder="e.g. 11112"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.push("/vendor/equipments")}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createEquipmentMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {createEquipmentMutation.isPending
              ? "Creating..."
              : "Create Equipment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewMyEquipmentPage() {
  return (
    <PermissionGate permission={Permission.VIEW_VENDOR_EQUIPMENTS}>
      <NewMyEquipmentContent />
    </PermissionGate>
  );
}
