"use client";

import { useParams, useRouter } from "next/navigation";
import { useVendor } from "@/features/vendors/useVendor";
import { getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorCode = params.vendorCode as string;

  const {
    vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useVendor(vendorCode);

  const {
    data: contractsData,
    isLoading: contractsLoading,
    error: contractsError,
  } = useQuery({
    queryKey: ["contracts", vendorCode],
    queryFn: () => getContracts({ vendor_code: vendorCode }),
    enabled: !!vendorCode,
  });

  const contracts = contractsData?.data || [];

  if (vendorLoading || contractsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (vendorError || contractsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">Failed to load vendor details</p>
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

  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-yellow-500 text-xl mb-2">🔍</div>
          <p className="text-gray-600">Vendor not found</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <h1 className="text-4xl font-bold text-gray-900">
                {vendor.name}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Vendor Code: {vendor.code}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
                  vendor.is_active === "1"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                {vendor.is_active === "1" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
                <p className="text-3xl font-bold text-blue-600">
                  {contracts.length}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Total Contracts
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
                  {contracts.filter((c) => c.status === "active").length}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  Active Contracts
                </p>
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
                    d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">
                  {new Set(contracts.map((c) => c.facility.code)).size}
                </p>
                <p className="text-sm font-medium text-gray-600">Facilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              Vendor Information
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Vendor Name
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {vendor.name}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Vendor Code
                </label>
                <p className="text-lg font-medium text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg inline-block">
                  {vendor.code}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p
                  className={`text-lg font-semibold ${
                    vendor.is_active === "1" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {vendor.is_active === "1" ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Created Date
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(vendor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
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
                  No contracts found for this vendor
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Contract
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Facility
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Period
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
                              {contract.contract_number}
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
                            <p>
                              {contract.start_date} - {contract.end_date}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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
                        <td className="px-6 py-4">
                          <div className="flex space-x-3">
                            <button
                              onClick={() =>
                                router.push(`/contracts/${contract.id}`)
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              View Contract
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
        </div>
      </div>
    </div>
  );
}
