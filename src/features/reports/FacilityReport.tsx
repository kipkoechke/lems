"use client";

import { IFacilityReport, ReportForm } from "@/services/apiReport";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateFacilityReport } from "./useCreateFacilityReport";

const FacilityReport: React.FC = () => {
  const { createReport, isCreatingReport } = useCreateFacilityReport();
  const [reportData, setReportData] = useState<IFacilityReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportForm>();

  const getChartData = (data: IFacilityReport[]) => {
    if (!data) return [];
    return data.flatMap((facility: IFacilityReport) =>
      (facility.equipments ?? []).map((eq: any) => ({
        facility_equipment: `${facility.facility} - ${eq.equipment}`,
        equipment_total_revenue: eq.equipment_total_revenue,
      }))
    );
  };

  const onSubmit = (data: ReportForm) => {
    setError(null);
    setReportData(null);

    createReport(
      { start_date: data.start_date, end_date: data.end_date },
      {
        onSuccess: (result: IFacilityReport[]) => setReportData(result), // Remove the array wrapping
        onError: (err: any) =>
          setError(err?.message || "Failed to generate report."),
      }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Facility Report</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-end gap-4 mb-8"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            {...register("start_date", { required: "Start date is required" })}
            className="border rounded px-2 py-1"
          />
          {errors.start_date && (
            <span className="text-red-500 text-xs">
              {errors.start_date.message}
            </span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            {...register("end_date", { required: "End date is required" })}
            className="border rounded px-2 py-1"
          />
          {errors.end_date && (
            <span className="text-red-500 text-xs">
              {errors.end_date.message}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isCreatingReport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isCreatingReport ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {reportData && reportData.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">Facility Revenue Report</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-300 text-left font-semibold">
                    Facility
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 text-left font-semibold">
                    Total Revenue
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 text-left font-semibold">
                    Equipment
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 text-left font-semibold">
                    Equipment Revenue
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 text-left font-semibold">
                    Service
                  </th>
                  <th className="px-4 py-2 border-b border-gray-300 text-left font-semibold">
                    Service Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((facility, facilityIndex) => {
                  let facilityRowSpan = 0;
                  // Calculate total rows needed for this facility
                  facility.equipments?.forEach((eq) => {
                    facilityRowSpan += eq.services?.length || 1;
                  });

                  let currentRow = 0;
                  return (
                    facility.equipments?.map((equipment, equipmentIndex) => {
                      const equipmentRowSpan = equipment.services?.length || 1;

                      return (
                        equipment.services?.map(
                          (
                            service: {
                              service: string;
                              revenue?: number;
                            },
                            serviceIndex: number
                          ) => {
                            const isFirstRowOfFacility = currentRow === 0;
                            const isFirstRowOfEquipment = serviceIndex === 0;
                            currentRow++;

                            return (
                              <tr
                                key={`${facilityIndex}-${equipmentIndex}-${serviceIndex}`}
                                className="border-b border-gray-300"
                              >
                                {/* Facility name and total revenue - only show on first row */}
                                {isFirstRowOfFacility && (
                                  <>
                                    <td
                                      className="px-4 py-2 border-r border-gray-300 font-semibold bg-blue-50"
                                      rowSpan={facilityRowSpan}
                                    >
                                      {facility.facility}
                                    </td>
                                    <td
                                      className="px-4 py-2 border-r border-gray-300 font-semibold bg-blue-50"
                                      rowSpan={facilityRowSpan}
                                    >
                                      $
                                      {facility.total_revenue?.toLocaleString()}
                                    </td>
                                  </>
                                )}

                                {/* Equipment name and revenue - only show on first service row */}
                                {isFirstRowOfEquipment && (
                                  <>
                                    <td
                                      className="px-4 py-2 border-r border-gray-300 bg-gray-50"
                                      rowSpan={equipmentRowSpan}
                                    >
                                      {equipment.equipment}
                                    </td>
                                    <td
                                      className="px-4 py-2 border-r border-gray-300 bg-gray-50"
                                      rowSpan={equipmentRowSpan}
                                    >
                                      $
                                      {equipment.equipment_total_revenue?.toLocaleString()}
                                    </td>
                                  </>
                                )}

                                {/* Service name and revenue - always show */}
                                <td className="px-4 py-2 border-r border-gray-300">
                                  {service.service}
                                </td>
                                <td className="px-4 py-2">
                                  ${service.revenue?.toLocaleString()}
                                </td>
                              </tr>
                            );
                          }
                        ) || []
                      );
                    }) || []
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityReport;
