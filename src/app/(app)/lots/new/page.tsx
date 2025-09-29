"use client";
import BackButton from "@/components/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateLot } from "@/features/lots/useCreateLot";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaLayerGroup, FaSave, FaTimes } from "react-icons/fa";

const lotSchema = z.object({
  number: z.string().min(1, "Lot number is required"),
  name: z.string().min(2, "Lot name must be at least 2 characters"),
  is_active: z.boolean(),
});

type LotFormData = z.infer<typeof lotSchema>;

export default function NewLotPage() {
  const router = useRouter();
  const { createLot, isCreating } = useCreateLot();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LotFormData>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const onSubmit = (data: LotFormData) => {
    createLot(data, {
      onSuccess: (newLot) => {
        router.push(`/lots/${newLot.id}`);
      },
    });
  };

  return (
    <PermissionGate permission={Permission.ONBOARD_LOTS}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
              <div className="flex items-center gap-3 md:gap-4">
                <BackButton onClick={() => router.back()} />
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaLayerGroup className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Create New Lot
                  </h1>
                  <p className="text-sm md:text-base text-indigo-100">
                    Add a new service lot to the system
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Lot Information */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FaLayerGroup className="w-4 h-4 text-indigo-600" />
                  </div>
                  Lot Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label
                      htmlFor="number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Lot Number *
                    </label>
                    <input
                      type="text"
                      id="number"
                      {...register("number")}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.number
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter lot number (e.g., LOT001)"
                    />
                    {errors.number && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.number.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Lot Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...register("name")}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.name
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter lot name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        {...register("is_active")}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active Lot
                      </span>
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                      Active lots are available for service assignment and
                      contract creation
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Lot...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Create Lot
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/lots")}
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
