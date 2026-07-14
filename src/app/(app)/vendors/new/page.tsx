"use client";

import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateVendor } from "@/features/vendors/useCreateVendor";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaSave, FaTimes } from "react-icons/fa";
import { vendorSchema, VendorFormData } from "@/lib/validations";
import { InputField } from "@/components/common/InputField";

function NewVendorContent() {
  const router = useRouter();
  const { createVendor, isCreating } = useCreateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const onSubmit = (data: VendorFormData) => {
    createVendor(
      {
        ...data,
        // New vendors are always created active.
        is_active: "1",
      },
      {
        onSuccess: () => {
          router.push("/vendors");
        },
      }
    );
  };

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New Vendor</h1>
            <p className="text-sm text-slate-500">Create a new vendor profile</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Vendor Code */}
              <InputField
                label="Vendor Code"
                type="text"
                placeholder="Enter vendor code"
                register={register("code")}
                error={errors.code?.message}
                required
                disabled={isCreating}
              />

              {/* Vendor Name */}
              <InputField
                label="Vendor Name"
                type="text"
                placeholder="Enter vendor name"
                register={register("name")}
                error={errors.name?.message}
                required
                disabled={isCreating}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/vendors")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center space-x-2"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isCreating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <FaSave className="w-4 h-4" />
                <span>{isCreating ? "Creating..." : "Create Vendor"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewVendorPage() {
  return (
    <PermissionGate permission={Permission.ONBOARD_VENDORS}>
      <NewVendorContent />
    </PermissionGate>
  );
}
