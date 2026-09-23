"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import {
  Permission,
  UserRole,
  getRoleDisplayName,
  isFacilityRole,
} from "@/lib/rbac";
import { useCurrentUser, useCurrentFacility } from "@/hooks/useAuth";
import { useCreateUser } from "@/features/users/useUsers";
import { useVendors } from "@/features/vendors/useVendors";
import { UserCreateRequest } from "@/services/apiUsers";
import BackButton from "@/components/common/BackButton";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { FacilityFilter } from "@/components/common/FacilityFilter";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FaSave, FaTimes } from "react-icons/fa";

/** Roles a facility admin may provision — never another admin. */
const FACILITY_ADMIN_CREATABLE_ROLES: UserRole[] = [
  UserRole.F_VIEW_ONLY,
  UserRole.F_PRACTITIONER,
  UserRole.F_FINANCE,
  UserRole.F_EQUIPMENT_USER,
];

/** Roles a system admin may provision. */
const SYSTEM_ADMIN_CREATABLE_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.F_ADMIN,
  ...FACILITY_ADMIN_CREATABLE_ROLES,
  UserRole.VENDOR,
  UserRole.C_REC,
  UserRole.B_APPROVER,
  UserRole.PROVIDER_PORTAL,
  UserRole.PAYER,
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const ID_TYPES = [
  { value: "National ID", label: "National ID" },
  { value: "Passport", label: "Passport" },
  { value: "Alien ID", label: "Alien ID" },
  { value: "Military ID", label: "Military ID" },
];

type UserFormData = Omit<UserCreateRequest, "postal_address">;

function NewUserContent() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const currentFacility = useCurrentFacility();
  const { createUser, isCreating } = useCreateUser();

  // A facility admin provisions only for their own facility: the API forces
  // the facility from their profile and rejects facility_id / vendor_id.
  const isFacilityAdmin = isFacilityRole(currentUser?.role);

  const [facilityId, setFacilityId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const { vendors, isLoading: vendorsLoading } = useVendors();

  const roleOptions = useMemo(() => {
    const roles = isFacilityAdmin
      ? FACILITY_ADMIN_CREATABLE_ROLES
      : SYSTEM_ADMIN_CREATABLE_ROLES;
    return roles.map((role) => ({
      value: role,
      label: getRoleDisplayName(role),
    }));
  }, [isFacilityAdmin]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: { role: roleOptions[0]?.value, is_active: true },
  });

  const role = watch("role");
  const email = watch("email");
  const phone = watch("phone");

  const needsFacility = !isFacilityAdmin && isFacilityRole(role);
  const needsVendor = !isFacilityAdmin && role === UserRole.VENDOR;

  const onSubmit = (data: UserFormData) => {
    // The API takes either, but needs at least one to reach the person.
    if (!data.email && !data.phone) {
      setError("email", {
        message: "Provide an email address or a phone number",
      });
      return;
    }

    if (needsFacility && !facilityId) {
      setError("role", { message: "Select the facility for this user" });
      return;
    }

    if (needsVendor && !vendorId) {
      setError("role", { message: "Select the vendor for this user" });
      return;
    }

    createUser(
      {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        is_active: true,
        // Omitted entirely for a facility admin — the API rejects them.
        facility_id: needsFacility ? facilityId : undefined,
        vendor_id: needsVendor ? vendorId : undefined,
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
            <p className="text-sm text-slate-500">
              {isFacilityAdmin
                ? `New account at ${currentFacility?.name || "your facility"}`
                : "Create a new system user"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">
              Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InputField
                label="Full Name"
                type="text"
                placeholder="Enter full name"
                register={register("name", { required: "Name is required" })}
                error={errors.name?.message}
                required
                disabled={isCreating}
              />

              <SelectField
                label="Role"
                register={register("role", { required: "Role is required" })}
                error={errors.role?.message}
                required
                placeholder="Select role"
                options={roleOptions}
                disabled={isCreating}
              />

              <InputField
                label="Email"
                type="email"
                placeholder="name@facility.go.ke"
                register={register("email")}
                error={errors.email?.message}
                disabled={isCreating}
              />

              <InputField
                label="Phone"
                type="text"
                placeholder="+2547..."
                register={register("phone")}
                error={errors.phone?.message}
                disabled={isCreating}
              />
            </div>

            {(!email && !phone) && (
              <p className="mt-2 text-xs text-slate-500">
                Provide at least one of email or phone.
              </p>
            )}

            {/* Institution — system admins only; a facility admin's users are
                pinned to their own facility by the API. */}
            {(needsFacility || needsVendor) && (
              <>
                <h2 className="text-sm font-semibold text-slate-900 mt-6 mb-4">
                  Institution
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {needsFacility && (
                    <FacilityFilter
                      label="Facility"
                      placeholder="Select facility"
                      value={facilityId}
                      onChange={setFacilityId}
                    />
                  )}
                  {needsVendor && (
                    <SearchableSelect
                      label="Vendor"
                      required
                      placeholder="Select vendor"
                      options={vendors.map((vendor) => ({
                        value: vendor.id,
                        label: vendor.name,
                      }))}
                      value={vendorId}
                      onChange={setVendorId}
                      isLoading={vendorsLoading}
                    />
                  )}
                </div>
              </>
            )}

            {/* Profile */}
            <h2 className="text-sm font-semibold text-slate-900 mt-6 mb-4">
              Profile <span className="font-normal text-slate-400">(optional)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InputField
                label="Salutation"
                type="text"
                placeholder="Dr., Mr., Ms."
                register={register("salutation")}
                disabled={isCreating}
              />

              <SelectField
                label="Gender"
                register={register("gender")}
                placeholder="Select gender"
                options={GENDERS}
                disabled={isCreating}
              />

              <InputField
                label="Professional ID"
                type="text"
                placeholder="e.g. R/12345"
                register={register("professional_id")}
                disabled={isCreating}
              />

              <InputField
                label="Registration ID"
                type="text"
                placeholder="e.g. KMPDC/2020/00123"
                register={register("registration_id")}
                disabled={isCreating}
              />

              <SelectField
                label="Identification Type"
                register={register("identification_type")}
                placeholder="Select type"
                options={ID_TYPES}
                disabled={isCreating}
              />

              <InputField
                label="Identification Number"
                type="text"
                placeholder="Enter ID number"
                register={register("identification_number")}
                disabled={isCreating}
              />
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
