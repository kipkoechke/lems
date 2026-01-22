"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVendor } from "@/features/vendors/useVendor";
import { useCreateVendorEquipment } from "@/features/vendors/useVendorEquipments";
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
  status: z.enum([
    "active",
    "inactive",
    "maintenance",
    "decommissioned",
    "pending_installation",
  ]),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

// Equipment categories
const EQUIPMENT_CATEGORIES = [
  { value: "ct_scanner_multi_slice", label: "Multi-Slice CT Scanner" },
  { value: "mri_scanner", label: "MRI Scanner" },
  { value: "xray_machine", label: "X-Ray Machine" },
  { value: "ultrasound", label: "Ultrasound" },
  { value: "mammography", label: "Mammography" },
  { value: "dental_xray", label: "Dental X-Ray" },
  { value: "surgical_table", label: "Surgical/OT Table" },
  { value: "anesthesia_machine", label: "Anesthesia Machine" },
  { value: "ventilator", label: "Ventilator" },
  { value: "patient_monitor", label: "Patient Monitor" },
  { value: "defibrillator", label: "Defibrillator" },
  { value: "ecg_machine", label: "ECG Machine" },
  { value: "dialysis_machine", label: "Dialysis Machine" },
  { value: "centrifuge", label: "Centrifuge" },
  { value: "autoclave", label: "Autoclave/Sterilizer" },
  { value: "incubator", label: "Incubator" },
  { value: "water_treatment", label: "Water Treatment System" },
  { value: "laboratory_analyzer", label: "Laboratory Analyzer" },
  { value: "endoscope", label: "Endoscope" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "decommissioned", label: "Decommissioned" },
  { value: "pending_installation", label: "Pending Installation" },
];

export default function NewVendorEquipmentPage() {
  const params = useParams();
  const router = useRouter();
  const vendorCode = params.vendorCode as string;

  const { vendor, isLoading: vendorLoading } = useVendor(vendorCode);
  const createEquipmentMutation = useCreateVendorEquipment();

  // Specifications state
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    {},
  );
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      status: "active",
    },
  });

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
    if (!vendor?.id) return;

    createEquipmentMutation.mutate(
      {
        vendorId: vendor.id,
        data: {
          ...data,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : undefined,
        },
      },
      {
        onSuccess: () => {
          router.push(`/vendors/${vendorCode}/equipments`);
        },
      },
    );
  };

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-yellow-500 text-xl mb-2">🔍</div>
          <p className="text-slate-600">Vendor not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton onClick={() => router.back()} />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Add New Equipment
          </h1>
          <p className="text-sm text-slate-500">{vendor.name}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">
            Basic Information
          </h2>
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
              options={STATUS_OPTIONS}
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

          {/* Add Specification */}
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

          {/* Specifications List */}
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

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
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
