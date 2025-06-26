"use client";
import Modal from "@/components/Modal";
import {
  useFacilities,
  useUpdateFacility,
} from "@/features/facilities/useFacilities";
import {
  EditFacilityForm as EditFacility,
  Facility,
} from "@/services/apiFacility";
import { useState } from "react";
import { useForm } from "react-hook-form";

function EditFacilityForm({
  facility,
  onSuccess,
}: {
  facility: Facility;
  onSuccess: () => void;
}) {
  const { register, handleSubmit, reset } = useForm<EditFacility>({
    defaultValues: {
      name: facility.name,
      code: facility.code,
    },
  });

  const { editFacility, isEditing } = useUpdateFacility();

  const onSubmit = (data: EditFacility) => {
    editFacility({ id: facility.id, data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-2">
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Facility Name
        </label>
        <input
          {...register("name", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Facility Code
        </label>
        <input
          {...register("code", { required: true })}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* {updateFacilityMutation.isError && (
        <div className="text-red-600 text-sm mb-2">
          {updateFacilityMutation.error instanceof Error
            ? updateFacilityMutation.error.message
            : "Failed to update facility"}
        </div>
      )} */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isEditing}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isEditing ? "Updating..." : "Update Facility"}
        </button>
      </div>
    </form>
  );
}

function Facilities() {
  const { isLoading, facilities, error } = useFacilities();
  const [editFacility, setEditFacility] = useState<Facility | null>(null);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading facilities...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600">
            Error loading facilities: {error?.message || "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  const facilityData = facilities ?? [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Facilities</h1>
        <div className="text-sm text-gray-600">
          Total: {facilityData.length} facilities
        </div>
      </div>

      {facilityData.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <div className="text-gray-600">No facilities found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b border-gray-200 text-left font-semibold text-gray-700">
                  Facility Code
                </th>
                <th className="px-4 py-3 border-b border-gray-200 text-left font-semibold text-gray-700">
                  Facility Name
                </th>
                <th className="px-4 py-3 border-b border-gray-200 text-left font-semibold text-gray-700">
                  Created Date
                </th>
                <th className="px-4 py-3 border-b border-gray-200 text-left font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {facilityData.map((facility: Facility, index: number) => (
                <tr
                  key={facility.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <td className="px-4 py-3 text-gray-700">{facility.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {facility.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(facility.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Modal>
                      <Modal.Open opens={`edit-facility-${facility.id}`}>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          onClick={() => setEditFacility(facility)}
                        >
                          Edit
                        </button>
                      </Modal.Open>
                      <Modal.Window name={`edit-facility-${facility.id}`}>
                        <EditFacilityForm
                          facility={facility}
                          onSuccess={() => {
                            setEditFacility(null);
                          }}
                        />
                      </Modal.Window>
                    </Modal>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Facilities;
