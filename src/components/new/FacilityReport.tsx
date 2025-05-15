"use client";

import { useFacilityReport } from "@/components/new/useFacilityReport";
import React, { useState } from "react";

const FacilityReport: React.FC = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading, isError, error } = useFacilityReport(
    startDate ? new Date(startDate) : new Date(),
    endDate ? new Date(endDate) : new Date()
  );

  const handleFetchReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Facility Report</h1>
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full p-2 border rounded"
            />
          </label>
        </div>
        <button
          onClick={handleFetchReport}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Fetch Report
        </button>
      </div>

      {isLoading && <p>Loading...</p>}
      {isError && (
        <p className="text-red-500">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      )}
      {data && (
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-4">Report Data</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Facility Name</th>
                <th className="px-4 py-2 border-b">Total Services Fulfilled</th>
                <th className="px-4 py-2 border-b">Total Facility Share</th>
                <th className="px-4 py-2 border-b">Equipment Name</th>
                <th className="px-4 py-2 border-b">Service Description</th>
              </tr>
            </thead>
            <tbody>
              {data.map((facility: any) => {
                // Get the first equipment and service
                const firstEquipment = facility.equipment[0];
                const firstService = facility.services[0];

                if (!firstEquipment || !firstService) return null;

                return (
                  <tr key={facility.facilityId}>
                    <td className="px-4 py-2 border-b">
                      {facility.facilityName}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {facility.totalServicesFulfilled}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {facility.totalFacilityShare}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {firstEquipment.equipmentName}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {firstService.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacilityReport;
