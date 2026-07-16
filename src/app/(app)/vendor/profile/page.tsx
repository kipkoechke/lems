"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useMyVendor } from "@/features/vendors/useMyVendor";
import { useUpdateVendor } from "@/features/vendors/useUpdateVendor";
import { InputField } from "@/components/common/InputField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaSave, FaTimes } from "react-icons/fa";

interface ProfileFormData {
  name: string;
  email?: string;
  phone?: string;
}

function VendorProfileContent() {
  const { vendor, vendorId, isLoading, error, refetch } = useMyVendor();
  const { updateVendor, isUpdating } = useUpdateVendor();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm<ProfileFormData>();

  useEffect(() => {
    if (vendor) {
      reset({
        name: vendor.name,
        email: vendor.email ?? "",
        phone: vendor.phone ?? "",
      });
    }
  }, [vendor, reset]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-5 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <ErrorState
        title="Unable to Load Your Vendor Profile"
        error={error}
        message={!error && !vendor ? "No vendor is linked to your account." : undefined}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  const onSubmit = (data: ProfileFormData) => {
    updateVendor(
      {
        id: vendorId,
        name: data.name,
        code: vendor.code,
        is_active:
          vendor.is_active === true || vendor.is_active === "1" ? "1" : "0",
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          refetch();
        },
      },
    );
  };

  const isActive = vendor.is_active === true || vendor.is_active === "1";

  const details = [
    { label: "Vendor Name", value: vendor.name },
    { label: "Vendor Code", value: vendor.code },
    { label: "Email", value: vendor.email },
    { label: "Phone", value: vendor.phone },
  ];

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {vendor.name}
            </h1>
            <p className="text-sm text-slate-500 font-mono">{vendor.code}</p>
          </div>
          <span
            className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Body */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <InputField
                  label="Vendor Name"
                  type="text"
                  placeholder="Enter vendor name"
                  register={register("name", { required: true })}
                  required
                  disabled={isUpdating}
                />
                <InputField
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  register={register("email")}
                  disabled={isUpdating}
                />
                <InputField
                  label="Phone"
                  type="text"
                  placeholder="Enter phone number"
                  register={register("phone")}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaTimes className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaSave className="w-4 h-4" />
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              {details.map((d) => (
                <div key={d.label}>
                  <p className="text-xs text-slate-500">{d.label}</p>
                  <p className="text-sm font-medium text-slate-900">
                    {d.value || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VendorProfilePage() {
  return (
    <PermissionGate permission={Permission.VIEW_DASHBOARD}>
      <VendorProfileContent />
    </PermissionGate>
  );
}
