"use client";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { usePatient } from "@/features/patients/usePatient";
import { useUpdatePatient } from "@/features/patients/useUpdatePatient";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaUser, FaPhone, FaSave, FaTimes } from "react-icons/fa";
import { useEffect } from "react";

const patientEditSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  sha_number: z.string().optional(),
});

type PatientEditFormData = z.infer<typeof patientEditSchema>;

export default function PatientEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { patient, isLoading, error } = usePatient(params.id);
  const { updatePatient, isPending } = useUpdatePatient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientEditFormData>({
    resolver: zodResolver(patientEditSchema),
  });

  // Reset form with patient data when loaded
  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        phone: patient.phone,
        date_of_birth: patient.date_of_birth.split("T")[0], // Format for date input
        sha_number: patient.sha_number || "",
      });
    }
  }, [patient, reset]);

  const onSubmit = (data: PatientEditFormData) => {
    updatePatient(
      {
        id: params.id,
        data: {
          ...data,
          sha_number: data.sha_number || null,
        },
      },
      {
        onSuccess: () => {
          router.push(`/patients/${params.id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading patient details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <p className="text-red-600">
                Error loading patient: {error?.message || "Patient not found"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate permission={Permission.VIEW_PATIENTS}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <BackButton onClick={() => router.back()} />
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaUser className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                      Edit Patient
                    </h1>
                    <p className="text-sm md:text-base text-blue-100">
                      Update patient information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-blue-600" />
                  </div>
                  Patient Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register("name")}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter patient's full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Phone Number *
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        id="phone"
                        {...register("phone")}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.phone
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter phone number"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="date_of_birth"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="date_of_birth"
                      {...register("date_of_birth")}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.date_of_birth
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.date_of_birth && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.date_of_birth.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="sha_number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      SHA Number
                    </label>
                    <input
                      type="text"
                      id="sha_number"
                      {...register("sha_number")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter SHA number (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Update Patient
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/patients/${params.id}`)}
                  className="flex-1 sm:flex-initial border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
