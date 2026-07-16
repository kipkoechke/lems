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
import { SelectField } from "@/components/common/SelectField";

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
      lifecycle_state: "active",
      country: "KE",
    },
  });

  const onSubmit = (data: VendorFormData) => {
    createVendor(
      {
        vendor_alpha_code: data.vendor_alpha_code,
        dha_vendor_code: data.dha_vendor_code,
        sha_vendor_code: data.sha_vendor_code,
        name: data.name,
        description: data.description || undefined,
        address: data.address || undefined,
        country: data.country || "KE",
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        lifecycle_state: data.lifecycle_state || "active",
      },
      {
        onSuccess: () => {
          router.push("/vendors");
        },
      },
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
              {/* Vendor Alpha Code */}
              <InputField
                label="Vendor Alpha Code"
                type="text"
                placeholder="Enter vendor alpha code (3-10 chars)"
                register={register("vendor_alpha_code")}
                error={errors.vendor_alpha_code?.message}
                required
                disabled={isCreating}
              />

              {/* DHA Vendor Code */}
              <InputField
                label="DHA Vendor Code"
                type="text"
                placeholder="Enter DHA vendor code"
                register={register("dha_vendor_code")}
                error={errors.dha_vendor_code?.message}
                required
                disabled={isCreating}
              />

              {/* SHA Vendor Code */}
              <InputField
                label="SHA Vendor Code"
                type="text"
                placeholder="Enter SHA vendor code"
                register={register("sha_vendor_code")}
                error={errors.sha_vendor_code?.message}
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

              {/* Email */}
              <InputField
                label="Email"
                type="email"
                placeholder="Enter email address"
                register={register("email")}
                error={errors.email?.message}
                disabled={isCreating}
              />

              {/* Phone */}
              <InputField
                label="Phone"
                type="text"
                placeholder="Enter phone number"
                register={register("phone")}
                error={errors.phone?.message}
                disabled={isCreating}
              />

              {/* Website */}
              <InputField
                label="Website"
                type="text"
                placeholder="Enter website URL"
                register={register("website")}
                error={errors.website?.message}
                disabled={isCreating}
              />

              {/* Address */}
              <InputField
                label="Address"
                type="text"
                placeholder="Enter address"
                register={register("address")}
                error={errors.address?.message}
                disabled={isCreating}
              />

              {/* Lifecycle State */}
              <SelectField
                label="Status"
                register={register("lifecycle_state")}
                error={errors.lifecycle_state?.message}
                disabled={isCreating}
                options={[
                  { value: "active", label: "Active" },
                  { value: "disabled", label: "Disabled" },
                  { value: "retired", label: "Retired" },
                ]}
              />

              {/* Description - full width */}
              <div className="md:col-span-2">
                <InputField
                  label="Description"
                  type="text"
                  placeholder="Enter vendor description"
                  register={register("description")}
                  error={errors.description?.message}
                  disabled={isCreating}
                />
              </div>
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
