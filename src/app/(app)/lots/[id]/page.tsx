"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useLotWithServices } from "@/features/lots/useLotWithServices";
import { getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";
import {
  FaArrowLeft,
  FaCogs,
  FaEdit,
  FaLayerGroup,
  FaCheckCircle,
  FaFileContract,
  FaBuilding,
} from "react-icons/fa";

export default function LotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<"services" | "contracts">(
    "services",
  );

  const {
    lot,
    services = [],
    isLoading: lotLoading,
    error: lotError,
  } = useLotWithServices(id);

  const {
    data: contractsData,
    isLoading: contractsLoading,
    error: contractsError,
  } = useQuery({
    queryKey: ["contracts", id],
    queryFn: () => getContracts({ lot_number: lot?.number }),
    enabled: !!lot?.number,
  });

  const contracts = contractsData?.data || [];

  if (lotLoading || contractsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lot details...</p>
        </div>
      </div>
    );
  }

  if (lotError || contractsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">Failed to load lot details</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
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
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const activeServices = services.filter((s) => s.is_active);

  const stats = [
    {
      label: "Total Services",
      value: services.length,
      icon: FaLayerGroup,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Active Services",
      value: activeServices.length,
      icon: FaCheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Contracts",
      value: contracts.length,
      icon: FaFileContract,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Vendors",
      value: new Set(contracts.map((c) => c.vendor.code)).size,
      icon: FaBuilding,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">
              {lot.name}
            </h1>
            <p className="text-sm text-slate-500">Lot Number: {lot.number}</p>
          </div>
          <span
            className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              lot.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {lot.is_active ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => router.push(`/lots/${id}/edit`)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FaEdit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-slate-200 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}
                >
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b border-gray-100 px-4">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("services")}
                className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === "services"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Services ({services.length})
              </button>
              <button
                onClick={() => setActiveTab("contracts")}
                className={`py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === "contracts"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Contracts ({contracts.length})
              </button>
            </div>
            {activeTab === "services" && (
              <button
                onClick={() => router.push(`/lots/${id}/services`)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <FaCogs className="w-3.5 h-3.5" />
                Manage Services
              </button>
            )}
          </div>

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="p-4">
              {services.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No services found for this lot
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tariff
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Vendor Share
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Facility Share
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {services.map((service) => (
                        <tr
                          key={service.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {service.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              Code: {service.code}
                            </p>
                            {service.capitated && (
                              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800 mt-1">
                                Capitated
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {service.tariff.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {service.vendor_share.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {service.facility_share.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                service.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {service.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() =>
                                router.push(`/lots/${id}/services`)
                              }
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              <FaEdit className="w-3.5 h-3.5" />
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === "contracts" && (
            <div className="p-4">
              {contracts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No contracts found for this lot
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Contract
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Facility
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contracts.map((contract) => (
                        <tr
                          key={contract.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {contract.contract_number}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {contract.vendor.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              Code: {contract.vendor.code}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {contract.facility.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              Code: {contract.facility.code}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {contract.start_date} - {contract.end_date}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                contract.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : contract.status === "expired"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {contract.status.charAt(0).toUpperCase() +
                                contract.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() =>
                                  router.push(`/vendors/${contract.vendor.code}`)
                                }
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                              >
                                View Vendor
                              </button>
                              <button
                                onClick={() =>
                                  router.push(
                                    `/facilities/${contract.facility.code}`,
                                  )
                                }
                                className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                              >
                                View Facility
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
