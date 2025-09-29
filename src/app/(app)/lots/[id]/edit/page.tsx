"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLots } from "@/features/lots/useLots";
import { useUpdateLot } from "@/features/lots/useUpdateLot";
import BackButton from "@/components/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useState, useEffect } from "react";

const lotFormSchema = z.object({
  name: z.string().min(1, "Lot name is required"),
  number: z.string().min(1, "Lot number is required"),
  is_active: z.boolean(),
});

type LotFormData = z.infer<typeof lotFormSchema>;

function EditLotContent() {
  const params = useParams();
  const router = useRouter();
  const lotId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { lots, isLoading, error } = useLots();
  const { updateLot, isUpdating, error: updateError } = useUpdateLot();

  // Find the specific lot from the lots array
  const lot = lots.find((l) => l.id === lotId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LotFormData>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      name: "",
      number: "",
      is_active: true,
    },
  });

  // Populate form with lot data when available
  useEffect(() => {
    if (lot) {
      setValue("name", lot.name);
      setValue("number", lot.number);
      setValue("is_active", lot.is_active === "1");
    }
  }, [lot, setValue]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lot details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">Failed to load lot details</p>
          <BackButton onClick={() => router.back()} />
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-yellow-500 text-xl mb-2">🔍</div>
          <p className="text-gray-600">Lot not found</p>
          <BackButton onClick={() => router.back()} />
        </div>
      </div>
    );
  }

  const onSubmit = (data: LotFormData) => {
    setIsSubmitting(true);
    updateLot(
      {
        id: lot.id,
        number: data.number,
        name: data.name,
        is_active: data.is_active,
      },
      {
        onSuccess: () => {
          router.push(`/lots/${lotId}`);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  const isActive = watch("is_active");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <BackButton onClick={() => router.back()} />
          <h1 className="text-4xl font-bold text-gray-900 mt-4">Edit Lot</h1>
          <p className="text-gray-600 mt-2">Update lot information</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              Lot Information
            </h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lot Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Lot Name *
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter lot name"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* Lot Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Lot Number *
                </label>
                <input
                  type="text"
                  {...register("number")}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.number
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Enter lot number"
                />
                {errors.number && (
                  <p className="text-red-600 text-sm">
                    {errors.number.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register("is_active")}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Uncheck to deactivate this lot
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push(`/lots/${lotId}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUpdating}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {(isSubmitting || isUpdating) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {isSubmitting || isUpdating ? "Updating..." : "Update Lot"}
                </span>
              </button>
            </div>

            {/* Error Message */}
            {updateError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">
                  Failed to update lot. Please try again.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function EditLotPage() {
  return (
    <PermissionGate permission={Permission.ONBOARD_LOTS}>
      <EditLotContent />
    </PermissionGate>
  );
}
