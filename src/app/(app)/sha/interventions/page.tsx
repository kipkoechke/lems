"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useShaInterventions } from "@/features/sha/useSha";
import { ShaInterventionParams } from "@/services/apiSha";
import { Table } from "@/components/Table";
import { InputField } from "@/components/common/InputField";
import { ErrorState } from "@/components/common/ErrorState";
import { FaShieldAlt, FaSearch } from "react-icons/fa";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

function ShaInterventionsContent() {
  const [filters, setFilters] = useState<ShaInterventionParams>({});
  const { interventions, hasFilter, isLoading, error, refetch } =
    useShaInterventions(filters);

  const { register, handleSubmit, reset } = useForm<ShaInterventionParams>();

  const onSearch = (data: ShaInterventionParams) => {
    // Strip blanks so we don't send empty query params.
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => !!v),
    ) as ShaInterventionParams;
    setFilters(cleaned);
  };

  const onReset = () => {
    reset({
      patient_id: "",
      id_number: "",
      emr_request_id: "",
      facility_id: "",
      internal_request_id: "",
    });
    setFilters({});
  };

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FaShieldAlt className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                SHA Interventions
              </h1>
              <p className="text-sm text-slate-500">
                Completed interventions with equipment and result details
              </p>
            </div>
          </div>
        </div>

        {/* Lookup */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 md:p-6">
          <form onSubmit={handleSubmit(onSearch)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Patient ID"
                type="text"
                placeholder="Patient identifier"
                register={register("patient_id")}
              />
              <InputField
                label="ID Number"
                type="text"
                placeholder="National ID / MRN"
                register={register("id_number")}
              />
              <InputField
                label="EMR Request ID"
                type="text"
                placeholder="EMR request identifier"
                register={register("emr_request_id")}
              />
              <InputField
                label="Facility ID"
                type="text"
                placeholder="Facility identifier"
                register={register("facility_id")}
              />
              <InputField
                label="Internal Request ID"
                type="text"
                placeholder="Middleware request ID"
                register={register("internal_request_id")}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onReset}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaSearch className="w-3.5 h-3.5" /> Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {error ? (
          <ErrorState
            title="Unable to Load Interventions"
            error={error}
            action={{ label: "Try Again", onClick: () => refetch() }}
          />
        ) : !hasFilter ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
              <FaSearch className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Enter at least one identifier to search
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Interventions are looked up by patient, request, or facility.
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded" />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Request</Table.HeaderCell>
                    <Table.HeaderCell>Patient</Table.HeaderCell>
                    <Table.HeaderCell>Procedure</Table.HeaderCell>
                    <Table.HeaderCell>Equipment</Table.HeaderCell>
                    <Table.HeaderCell>Facility</Table.HeaderCell>
                    <Table.HeaderCell>Performed</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {interventions.length === 0 ? (
                    <Table.Empty colSpan={6}>
                      No interventions found for those identifiers.
                    </Table.Empty>
                  ) : (
                    interventions.map((item, i) => (
                      <Table.Row key={item.internal_request_id ?? item.id ?? i}>
                        <Table.Cell>
                          <div className="font-mono text-sm text-slate-900">
                            {item.emr_request_id || item.request_id || "-"}
                          </div>
                          {item.internal_request_id && (
                            <div className="text-xs text-slate-500 font-mono truncate max-w-[180px]">
                              {item.internal_request_id}
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-sm text-slate-900">
                            {item.patient_name || item.patient_id || "-"}
                          </div>
                          {item.id_number && (
                            <div className="text-xs text-slate-500 font-mono">
                              {item.id_number}
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-slate-700 font-mono">
                            {item.procedure_code || item.procedure || "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="text-sm text-slate-700">
                            {item.equipment?.name || "-"}
                          </div>
                          {item.equipment?.dicom_aet && (
                            <div className="text-xs text-slate-500 font-mono">
                              AET {item.equipment.dicom_aet}
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-slate-700">
                            {item.facility_name || item.facility_id || "-"}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-slate-600">
                            {formatDateTime(
                              item.performed_at || item.completed_at,
                            )}
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShaInterventionsPage() {
  return (
    <PermissionGate permission={Permission.VIEW_SHA_INTERVENTIONS}>
      <ShaInterventionsContent />
    </PermissionGate>
  );
}
