"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVendor } from "@/features/vendors/useVendor";
import { useUpdateVendor } from "@/features/vendors/useUpdateVendor";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { vendorSchema, VendorFormData } from "@/lib/validations";

function EditVendorContent() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorCode as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { vendor, isLoading, error } = useVendor(vendorId);
  const { updateVendor, isUpdating } = useUpdateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendor_alpha_code: "",
      dha_vendor_code: "",
      sha_vendor_code: "",
      name: "",
      lifecycle_state: "active",
      country: "KE",
    },
  });

  // Populate form with vendor data when available
  useEffect(() => {
    if (vendor) {
      setValue("vendor_alpha_code", vendor.vendor_alpha_code ?? vendor.code ?? "");
      setValue("dha_vendor_code", vendor.dha_vendor_code ?? "");
      setValue("sha_vendor_code", vendor.sha_vendor_code ?? "");
      setValue("name", vendor.name);
      setValue("email", vendor.email || "");
      setValue("phone", vendor.phone || "");
      setValue("address", vendor.address || "");
      setValue("website", vendor.website || "");
      setValue("description", vendor.description || "");
      setValue("country", vendor.country || "KE");
      setValue("lifecycle_state", vendor.lifecycle_state || "active");
    }
  }, [vendor, setValue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">Failed to load vendor details</p>
          <BackButton onClick={() => router.back()} />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-yellow-500 text-xl mb-2">🔍</div>
          <p className="text-gray-600">Vendor not found</p>
          <BackButton onClick={() => router.back()} />
        </div>
      </div>
    );
  }

  const onSubmit = (data: VendorFormData) => {
    setIsSubmitting(true);
    updateVendor(
      {
        vendorId: vendor.id,
        data: {
          vendor_alpha_code: data.vendor_alpha_code,
          dha_vendor_code: data.dha_vendor_code,
          sha_vendor_code: data.sha_vendor_code,
          name: data.name,
          description: data.description || undefined,
          address: data.address || undefined,
          country: data.country || undefined,
          email: data.email || undefined,
          phone: data.phone || undefined,
          website: data.website || undefined,
          lifecycle_state: data.lifecycle_state,
        },
      },
      {
        onSuccess: () => {
          router.push(`/vendors/${vendorId}`);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  const lifecycleState = watch("lifecycle_state");

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Vendor</h1>
            <p className="text-sm text-slate-500">Update vendor information</p>
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
                placeholder="Enter vendor alpha code"
                register={register("vendor_alpha_code")}
                error={errors.vendor_alpha_code?.message}
                required
                disabled={isSubmitting}
              />

              {/* DHA Vendor Code */}
              <InputField
                label="DHA Vendor Code"
                type="text"
                placeholder="Enter DHA vendor code"
                register={register("dha_vendor_code")}
                error={errors.dha_vendor_code?.message}
                required
                disabled={isSubmitting}
              />

              {/* SHA Vendor Code */}
              <InputField
                label="SHA Vendor Code"
                type="text"
                placeholder="Enter SHA vendor code"
                register={register("sha_vendor_code")}
                error={errors.sha_vendor_code?.message}
                required
                disabled={isSubmitting}
              />

              {/* Vendor Name */}
              <InputField
                label="Vendor Name"
                type="text"
                placeholder="Enter vendor name"
                register={register("name")}
                error={errors.name?.message}
                required
                disabled={isSubmitting}
              />

              {/* Email */}
              <InputField
                label="Email"
                type="email"
                placeholder="Enter email address"
                register={register("email")}
                error={errors.email?.message}
                disabled={isSubmitting}
              />

              {/* Phone */}
              <InputField
                label="Phone"
                type="text"
                placeholder="Enter phone number"
                register={register("phone")}
                error={errors.phone?.message}
                disabled={isSubmitting}
              />

              {/* Website */}
              <InputField
                label="Website"
                type="text"
                placeholder="Enter website URL"
                register={register("website")}
                error={errors.website?.message}
                disabled={isSubmitting}
              />

              {/* Address */}
              <InputField
                label="Address"
                type="text"
                placeholder="Enter address"
                register={register("address")}
                error={errors.address?.message}
                disabled={isSubmitting}
              />

              {/* Lifecycle State */}
              <SelectField
                label="Status"
                register={register("lifecycle_state")}
                error={errors.lifecycle_state?.message}
                disabled={isSubmitting}
                options={[
                  { value: "active", label: "Active" },
                  { value: "disabled", label: "Disabled" },
                  { value: "retired", label: "Retired" },
                ]}
              />

              {/* Description */}
              <div className="md:col-span-2">
                <InputField
                  label="Description"
                  type="text"
                  placeholder="Enter vendor description"
                  register={register("description")}
                  error={errors.description?.message}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Current Status Badge */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-slate-500">Current Status:</span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  lifecycleState === "active"
                    ? "bg-green-100 text-green-800"
                    : lifecycleState === "disabled"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {lifecycleState === "active"
                  ? "Active"
                  : lifecycleState === "disabled"
                    ? "Disabled"
                    : "Retired"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push(`/vendors/${vendorId}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all flex items-center space-x-2"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUpdating}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {(isSubmitting || isUpdating) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <FaSave className="w-4 h-4" />
                <span>
                  {isSubmitting || isUpdating ? "Saving..." : "Update Vendor"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditVendorPage() {
  return (
    <PermissionGate permission={Permission.ONBOARD_VENDORS}>
      <EditVendorContent />
    </PermissionGate>
  );
}
