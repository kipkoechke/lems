"use client";
import { useEquipments } from "@/features/equipments/useEquipments";
import { Equipment } from "@/services/apiEquipment";

// type EquipmentItem = {
//   equipmentId: string;
//   equipmentName: string;
//   serialNumber: string;
// status: string;
// createdAt: string;
// updatedAt: string;
//   deleteddAt?: string | null;
// };

function Equipments() {
  const { isLoading, equipments, error } = useEquipments();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading equipments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-600">
            Error loading equipments: {error?.message || "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  const equipmentData = equipments ?? [];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      available: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      unavailable: "bg-red-100 text-red-800",
      retired: "bg-gray-100 text-gray-800",
    };

    const colorClass =
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800";

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment Management</h1>
        <div className="text-sm text-gray-600">
          Total: {equipmentData.length} equipments
        </div>
      </div>

      {equipmentData.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <div className="text-gray-600">No equipments found</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Equipment Name
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Serial Number
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Equipment ID
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Created Date
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {equipmentData.map((equipment: Equipment, index: number) => (
                <tr
                  key={equipment.equipmentId}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {equipment.equipmentName}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-mono">
                    {equipment.serialNumber}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(equipment.status)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                    {equipment.equipmentId}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(equipment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(equipment.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Equipment Status Summary */}
      {equipmentData.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Equipment Status Summary
          </h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(
              equipmentData.reduce((acc, equipment) => {
                acc[equipment.status] = (acc[equipment.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                {getStatusBadge(status)}
                <span className="text-sm text-gray-600">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Equipments;
