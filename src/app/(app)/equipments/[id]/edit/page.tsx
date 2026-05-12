"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaCog } from "react-icons/fa";
import BackButton from "@/components/common/BackButton";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  useVendorEquipment,
  useUpdateVendorEquipment,
} from "@/features/vendors/useVendorEquipments";

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
  ae_title: z.string().max(16).optional(),
  hl7_host: z.string().optional(),
  hl7_port: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .optional()
    .or(z.literal("")),
  dicom_port: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .optional()
    .or(z.literal("")),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

// Equipment categories
const EQUIPMENT_CATEGORIES = [
  { value: "xray_digital", label: "Digital X-Ray" },
  { value: "xray_mobile", label: "Mobile X-Ray" },
  { value: "xray_portable", label: "Portable X-Ray" },
  { value: "fluoroscopy", label: "Fluoroscopy" },
  { value: "c_arm", label: "C-Arm" },
  { value: "ultrasound_general", label: "General Ultrasound" },
  { value: "ultrasound_3d_4d", label: "3D/4D Ultrasound" },
  { value: "ultrasound_portable", label: "Portable Ultrasound" },
  { value: "doppler", label: "Doppler" },
  { value: "mammography_digital", label: "Digital Mammography" },
  { value: "mammography_3d", label: "3D Mammography" },
  { value: "ct_scanner", label: "CT Scanner" },
  { value: "ct_scanner_multi_slice", label: "Multi-Slice CT Scanner" },
  { value: "mri_scanner", label: "MRI Scanner" },
  { value: "mri_open", label: "Open MRI" },
  { value: "linear_accelerator", label: "Linear Accelerator" },
  { value: "brachytherapy", label: "Brachytherapy" },
  { value: "cobalt_60", label: "Cobalt-60" },
  { value: "treatment_planning", label: "Treatment Planning" },
  { value: "simulator", label: "Simulator" },
  { value: "gamma_camera", label: "Gamma Camera" },
  { value: "spect", label: "SPECT" },
  { value: "pet_scanner", label: "PET Scanner" },
  { value: "pet_ct", label: "PET-CT" },
  { value: "cyclotron", label: "Cyclotron" },
  { value: "angiography", label: "Angiography" },
  { value: "cath_lab", label: "Cath Lab" },
  { value: "dsa", label: "DSA" },
  { value: "ecg", label: "ECG" },
  { value: "echocardiography", label: "Echocardiography" },
  { value: "holter_monitor", label: "Holter Monitor" },
  { value: "stress_test", label: "Stress Test" },
  { value: "pacemaker_programmer", label: "Pacemaker Programmer" },
  { value: "tmt", label: "TMT" },
  { value: "anesthesia_machine", label: "Anesthesia Machine" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
  { value: "decommissioned", label: "Decommissioned" },
  { value: "pending_installation", label: "Pending Installation" },
];

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useCurrentUser();
  const vendorId = user?.entity?.id || "";

  const {
    data: equipment,
    isLoading: equipmentLoading,
    error: equipmentError,
  } = useVendorEquipment(vendorId, params.id);
  const updateEquipmentMutation = useUpdateVendorEquipment();

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
    reset,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
  });

  // Populate form when equipment loads
  useEffect(() => {
    if (equipment) {
      reset({
        name: equipment.name,
        category: equipment.category,
        serial_number: equipment.serial_number || "",
        model: equipment.model || "",
        brand: equipment.brand || "",
        manufacture_date: equipment.manufacture_date
          ? equipment.manufacture_date.split("T")[0]
          : "",
        description: equipment.description || "",
        status: equipment.status,
        ae_title: equipment.dicom?.ae_title || "",
        hl7_host: equipment.dicom?.hl7_host || "",
        hl7_port: equipment.dicom?.hl7_port ?? undefined,
        dicom_port: equipment.dicom?.dicom_port ?? undefined,
      });
      if (equipment.specifications) {
        const specObj: Record<string, string> = {};
        Object.entries(equipment.specifications).forEach(([key, value]) => {
          specObj[key] = String(value);
        });
        setSpecifications(specObj);
      }
    }
  }, [equipment, reset]);

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

    updateEquipmentMutation.mutate(
      {
        vendorId,
        equipmentId: params.id,
        data: {
          ...data,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : undefined,
        },
      },
      {
        onSuccess: () => {
          router.push(`/equipments/${params.id}`);
        },
      },
    );
  };

  if (equipmentLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (equipmentError || !equipment) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-slate-600">Equipment not found</p>
            <button
              onClick={() => router.push("/equipments")}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Back to Equipment List
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                Edit Equipment
              </h1>
              <p className="text-sm text-slate-500">
                Update equipment information
              </p>
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

            {/* DICOM Configuration */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                DICOM Configuration
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Optional — required only for imaging equipment that connects via
                DICOM/MWL.
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 p-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push(`/equipments/${params.id}`)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateEquipmentMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
            >
              {updateEquipmentMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
