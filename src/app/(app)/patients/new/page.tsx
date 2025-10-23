"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { useRegisterPatient } from "@/features/patients/useRegisterPatient";

interface PatientFormData {
  identificationType: string;
  identificationNumber: string;
}

export default function NewPatientPage() {
  const router = useRouter();
  const { registerPatients, isRegistering } = useRegisterPatient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    mode: "onBlur",
  });

  const onSubmit = async (data: PatientFormData) => {
    registerPatients(data, {
      onSuccess: (patient) => {
        toast.success(
          `Patient ${patient.name} fetched and registered successfully!`
        );
        // Redirect to patients list or patient detail page
        router.push(`/patients/${patient.id}`);
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to register patient");
      },
    });
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
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Identification Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Patient Identification
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Enter the patient&apos;s identification details to fetch their
                information from the national registry.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Identification Type"
                  register={register("identificationType", {
                    required: "Identification type is required",
                  })}
                  error={errors.identificationType?.message}
                  required
                  disabled={isRegistering}
                  placeholder="Select identification type"
                  options={[
                    { value: "CR ID", label: "CR ID" },
                    { value: "National ID", label: "National ID" },
                    {
                      value: "Birth Certificate",
                      label: "Birth Certificate",
                    },
                    { value: "Temporary ID", label: "Temporary ID" },
                    { value: "Alien ID", label: "Alien ID" },
                    { value: "Passport", label: "Passport" },
                  ]}
                />

                <InputField
                  label="Identification Number"
                  type="text"
                  placeholder="Enter identification number"
                  register={register("identificationNumber", {
                    required: "Identification number is required",
                    minLength: {
                      value: 5,
                      message:
                        "Identification number must be at least 5 characters",
                    },
                  })}
                  error={errors.identificationNumber?.message}
                  required
                  disabled={isRegistering}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/patients")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isRegistering}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRegistering}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering Patient...
                  </div>
                ) : (
                  "Register Patient"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGate>
  );
}
