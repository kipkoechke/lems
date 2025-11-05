"use client";

import { useParams, useRouter } from "next/navigation";
import { useLotWithServices } from "@/features/lots/useLotWithServices";
import { getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";
import { FaCogs } from "react-icons/fa";

export default function LotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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

  const activeServices = services.filter((s) => s.is_active === "1");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </button>
              <h1 className="text-4xl font-bold text-gray-900">{lot.name}</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Lot Number: {lot.number}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                  lot.is_active === "1"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                {lot.is_active === "1" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {services.length}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Total Services
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {activeServices.length}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Active Services
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  {contracts.length}
                </p>
                <p className="text-sm font-medium text-gray-600">Contracts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 mr-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">
                  {new Set(contracts.map((c) => c.vendor.code)).size}
                </p>
                <p className="text-sm font-medium text-gray-600">Vendors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lot Information */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              Lot Information
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Lot Name
                </label>
                <p className="text-lg font-medium text-gray-900">{lot.name}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Lot Number
                </label>
                <p className="text-lg font-medium text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                  {lot.number}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p
                  className={`text-lg font-semibold ${
                    lot.is_active === "1" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {lot.is_active === "1" ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Services</h2>
            <button
              onClick={() => router.push(`/lots/${id}/services`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <FaCogs className="w-4 h-4" />
              Manage Services
            </button>
          </div>
          <div className="p-8">
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg">
                  No services found for this lot
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Vendor Share
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Facility Share
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {services.map((service) => (
                      <tr
                        key={service.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {service.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              Code: {service.code}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {service.description || "No description"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {service.vendor_share}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">
                            {service.facility_share}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              service.is_active === "1"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {service.is_active === "1" ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Contracts */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Contracts</h2>
          </div>
          <div className="p-8">
            {contracts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-lg">
                  No contracts found for this lot
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Facility
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
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
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {contract.vendor.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              Code: {contract.vendor.code}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {contract.facility.name}
                            </p>
                            <p className="text-sm text-gray-500 font-mono">
                              Code: {contract.facility.code}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">
                              {contract.services?.length || 0} service
                              {(contract.services?.length || 0) !== 1
                                ? "s"
                                : ""}
                            </span>
                            {contract.services &&
                              contract.services.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {contract.services
                                    .slice(0, 3)
                                    .map((service) => (
                                      <span
                                        key={service.service_id}
                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
                                      >
                                        {service.service_name}
                                      </span>
                                    ))}
                                  {contract.services.length > 3 && (
                                    <span className="text-xs text-gray-500 py-1">
                                      +{contract.services.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              contract.is_active === "1"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {contract.is_active === "1" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
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
                                  `/facilities/${contract.facility.code}`
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
        </div>
      </div>
    </div>
  );
}
