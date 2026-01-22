"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaCog } from "react-icons/fa";
import BackButton from "@/components/common/BackButton";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { useCurrentUser } from "@/hooks/useAuth";
import { useCreateVendorEquipment } from "@/features/vendors/useVendorEquipments";

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

export default function NewEquipmentPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const vendorId = user?.entity?.id || "";

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
    if (newSpecKey && newSpecValue) {
      setSpecifications((prev) => ({
        ...prev,
        [newSpecKey]: newSpecValue,
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    setSpecifications((prev) => {
      const newSpecs = { ...prev };
      delete newSpecs[key];
      return newSpecs;
    });
  };

  const onSubmit = (data: EquipmentFormData) => {
    if (!vendorId) return;

    createEquipmentMutation.mutate(
      {
        vendorId,
        data: {
          ...data,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : undefined,
        },
      },
      {
        onSuccess: () => {
          router.push("/equipments");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BackButton onClick={() => router.back()} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaCog className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Add New Equipment
              </h1>
              <p className="text-sm text-slate-500">Register new equipment</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg border border-slate-200"
        >
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Name"
                type="text"
                required
                register={register("name")}
                error={errors.name?.message}
                placeholder="Equipment name"
              />

              <SelectField
                label="Category"
                required
                register={register("category")}
                error={errors.category?.message}
                placeholder="Select category"
                options={EQUIPMENT_CATEGORIES}
              />

              <InputField
                label="Serial Number"
                type="text"
                register={register("serial_number")}
                placeholder="Serial number"
              />

              <InputField
                label="Model"
                type="text"
                register={register("model")}
                placeholder="Model"
              />

              <InputField
                label="Brand"
                type="text"
                register={register("brand")}
                placeholder="Brand/Manufacturer"
              />

              <InputField
                label="Manufacture Date"
                type="date"
                register={register("manufacture_date")}
                placeholder=""
              />

              <SelectField
                label="Status"
                required
                register={register("status")}
                error={errors.status?.message}
                placeholder="Select status"
                options={STATUS_OPTIONS}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Equipment description"
              />
            </div>

            {/* Specifications */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Specifications
              </h3>

              {/* Existing specifications */}
              {Object.keys(specifications).length > 0 && (
                <div className="space-y-2 mb-4">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <div className="flex gap-2">
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-sm text-slate-600">{value}</span>
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
              )}

              {/* Add new specification */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g., power)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 220V)"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 p-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/equipments")}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEquipmentMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {createEquipmentMutation.isPending
                ? "Creating..."
                : "Create Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
