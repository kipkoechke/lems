"use client";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateLot } from "@/features/lots/useCreateLot";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lotCreationSchema, LotCreationFormData } from "@/lib/validations";
import { InputField } from "@/components/common/InputField";
import { FaSave, FaTimes } from "react-icons/fa";

export default function NewLotPage() {
  const router = useRouter();
  const { createLot, isCreating } = useCreateLot();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LotCreationFormData>({
    resolver: zodResolver(lotCreationSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const onSubmit = (data: LotCreationFormData) => {
    // Transform to match API expectations
    const lotData = {
      number: data.number,
      name: data.name,
      is_active: data.is_active ?? true,
    };

    createLot(lotData, {
      onSuccess: (newLot) => {
        router.push(`/lots/${newLot.id}`);
      },
    });
  };

  return (
    <PermissionGate permission={Permission.ONBOARD_LOTS}>
      <div className="min-h-screen p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <BackButton onClick={() => router.back()} />
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Create New Lot
              </h1>
              <p className="text-sm text-slate-500">
                Add a new service lot to the system
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <InputField
                  label="Lot Number"
                  type="text"
                  placeholder="Enter lot number (e.g., LOT001)"
                  register={register("number")}
                  error={errors.number?.message}
                  required
                  disabled={isCreating}
                />

                <InputField
                  label="Lot Name"
                  type="text"
                  placeholder="Enter lot name"
                  register={register("name")}
                  error={errors.name?.message}
                  required
                  disabled={isCreating}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push("/lots")}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
