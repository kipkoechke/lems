"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { patientSchema, PatientFormData } from "@/lib/validations";
import { InputField } from "@/components/login/InputField";
import { SelectField } from "@/components/SelectField";

export default function NewPatientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log("Registering patient:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to patients list
      router.push("/patients");
    } catch (error) {
      console.error("Error registering patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGate
      permission={Permission.GET_PATIENT_FROM_REGISTRY}
      fallback={
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to register patients.
            </p>
            <Link
              href="/patients"
              className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
            >
              Back to Patients
            </Link>
          </div>
        </div>
      }
    >
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/patients" className="hover:text-blue-600">
              Patients
            </Link>
            <span>/</span>
            <span className="text-gray-900">New Patient</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register a new patient in the system
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="First Name"
                  type="text"
                  placeholder="Enter first name"
                  register={register("first_name")}
                  error={errors.first_name?.message}
                  required
                  disabled={isSubmitting}
                />

                <InputField
                  label="Last Name"
                  type="text"
                  placeholder="Enter last name"
                  register={register("last_name")}
                  error={errors.last_name?.message}
                  required
                  disabled={isSubmitting}
                />

                <InputField
                  label="ID Number"
                  type="text"
                  placeholder="Enter ID number"
                  register={register("id_number")}
                  error={errors.id_number?.message}
                  disabled={isSubmitting}
                />

                <InputField
                  label="Date of Birth"
                  type="date"
                  placeholder="Select date of birth"
                  register={register("date_of_birth")}
                  error={errors.date_of_birth?.message}
                  required
                  disabled={isSubmitting}
                />

                <SelectField
                  label="Gender"
                  register={register("gender")}
                  error={errors.gender?.message}
                  required
                  disabled={isSubmitting}
                  placeholder="Select gender"
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter phone number"
                  register={register("phone")}
                  error={errors.phone?.message}
                  required
                  disabled={isSubmitting}
                />

                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="Enter email address"
                  register={register("email")}
                  error={errors.email?.message}
                  disabled={isSubmitting}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter residential address"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push("/patients")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Registering..." : "Register Patient"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}
