"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useUpdateUser, useUser } from "@/features/users/useUsers";
import { userDisplayName } from "@/services/apiUsers";
import BackButton from "@/components/common/BackButton";
import { InputField } from "@/components/common/InputField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaSave, FaTimes } from "react-icons/fa";

interface EditUserFormData {
  email: string;
  full_name?: string;
  password?: string;
  is_active: boolean;
}

function EditUserContent() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { user, isLoading, error } = useUser(userId);
  const { updateUser, isUpdating } = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditUserFormData>();

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        full_name: user.name ?? "",
        password: "",
        is_active: user.is_active,
      });
    }
  }, [user, reset]);

  const isActive = watch("is_active");

  if (isLoading) {
    return (
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-5 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <ErrorState
        title="Unable to Load User"
        error={error}
        message={!error && !user ? "User not found" : undefined}
        action={{ label: "Back to Users", onClick: () => router.push("/users") }}
        fullScreen
      />
    );
  }

  const onSubmit = (data: EditUserFormData) => {
    updateUser(
      {
        userId,
        data: {
          email: data.email,
          full_name: data.full_name || undefined,
          // Only send a password when the admin actually typed a new one.
          password: data.password ? data.password : undefined,
          is_active: data.is_active,
        },
      },
      { onSuccess: () => router.push(`/users/${userId}`) },
    );
  };

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit User</h1>
            <p className="text-sm text-slate-500">
              Update {userDisplayName(user)}&apos;s details
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InputField
                label="Email"
                type="email"
                placeholder="Enter email address"
                register={register("email", { required: "Email is required" })}
                error={errors.email?.message}
                required
                disabled={isUpdating}
              />

              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter full name"
                register={register("full_name")}
                disabled={isUpdating}
              />

              <InputField
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current password"
                register={register("password", {
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
                error={errors.password?.message}
                disabled={isUpdating}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push(`/users/${userId}`)}
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
        </div>
      </div>
    </div>
  );
}

export default function EditUserPage() {
  return (
    <PermissionGate permission={Permission.CREATE_FACILITY_USERS}>
      <EditUserContent />
    </PermissionGate>
  );
}
