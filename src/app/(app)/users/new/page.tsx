"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateUser } from "@/features/users/useUsers";
import { UserCreateRequest } from "@/services/apiUsers";
import BackButton from "@/components/common/BackButton";
import { InputField } from "@/components/common/InputField";
import { FaSave, FaTimes } from "react-icons/fa";

type Scope = "standard" | "superuser" | "facility" | "vendor";

interface UserFormData extends UserCreateRequest {
  scope: Scope;
}

function NewUserContent() {
  const router = useRouter();
  const { createUser, isCreating } = useCreateUser();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: { scope: "standard", is_active: true },
  });

  const scope = watch("scope");

  const onSubmit = (data: UserFormData) => {
    const { scope: selectedScope, facility_id, vendor_id, ...rest } = data;

    createUser(
      {
        ...rest,
        // New users are created active; scope drives the boolean flags so the
        // caller never has to set four mutually-exclusive booleans by hand.
        is_active: true,
        is_superuser: selectedScope === "superuser",
        is_facility: selectedScope === "facility",
        is_vendor: selectedScope === "vendor",
        facility_id: selectedScope === "facility" ? facility_id : undefined,
        vendor_id: selectedScope === "vendor" ? vendor_id : undefined,
      },
      { onSuccess: () => router.push("/users") },
    );
  };

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <BackButton onClick={() => router.back()} />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Add New User</h1>
            <p className="text-sm text-slate-500">Create a new system user</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InputField
                label="Username"
                type="text"
                placeholder="Enter username"
                register={register("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                })}
                error={errors.username?.message}
                required
                disabled={isCreating}
              />

              <InputField
                label="Email"
                type="email"
                placeholder="Enter email address"
                register={register("email", { required: "Email is required" })}
                error={errors.email?.message}
                required
                disabled={isCreating}
              />

              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter full name"
                register={register("full_name")}
                disabled={isCreating}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                register={register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
                error={errors.password?.message}
                required
                disabled={isCreating}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Scope <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("scope")}
                  disabled={isCreating}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="standard">Standard</option>
                  <option value="superuser">Super Admin</option>
                  <option value="facility">Facility User</option>
                  <option value="vendor">Vendor User</option>
                </select>
              </div>

              {scope === "facility" && (
                <InputField
                  label="Facility ID"
                  type="text"
                  placeholder="Enter facility identifier"
                  register={register("facility_id", {
                    required: "Facility ID is required for facility users",
                  })}
                  error={errors.facility_id?.message}
                  required
                  disabled={isCreating}
                />
              )}

              {scope === "vendor" && (
                <InputField
                  label="Vendor ID"
                  type="text"
                  placeholder="Enter vendor UUID"
                  register={register("vendor_id", {
                    required: "Vendor ID is required for vendor users",
                  })}
                  error={errors.vendor_id?.message}
                  required
                  disabled={isCreating}
                />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/users")}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaTimes className="w-4 h-4" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                {isCreating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewUserPage() {
  return (
    <PermissionGate permission={Permission.CREATE_FACILITY_USERS}>
      <NewUserContent />
    </PermissionGate>
  );
}
