"use client";
import { useFacilities } from "@/features/facilities/useFacilities";
import { Facility } from "@/services/apiFacility";

function Facilities() {
  const { isLoading, facilities, error } = useFacilities();

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
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Facility Name
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Facility Code
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Contact Info
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Facility ID
                </th>
                <th className="px-4 py-3 border-b text-left font-semibold text-gray-700">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody>
              {facilityData.map((facility: Facility, index: number) => (
                <tr
                  key={facility.facilityId}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {facility.facilityName}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {facility.facilityCode}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {facility.contactInfo}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                    {facility.facilityId}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(facility.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
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
