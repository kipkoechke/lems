"use client";

import { useParams, useRouter } from "next/navigation";
import { useVendor } from "@/features/vendors/useVendor";
import { getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorCode = params.vendorCode as string;

  const { vendor, isLoading: vendorLoading, error: vendorError } = useVendor(vendorCode);
  
  const { 
    data: contracts = [], 
    isLoading: contractsLoading, 
    error: contractsError 
  } = useQuery({
    queryKey: ["contracts", vendorCode],
    queryFn: () => getContracts({ vendor_code: vendorCode }),
    enabled: !!vendorCode,
  });

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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-600 mt-1">Vendor Code: {vendor.code}</p>
          </div>
          <div className="text-right">
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                vendor.is_active === "1" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}
            >
              {vendor.is_active === "1" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Vendor Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <p className="text-gray-900">{vendor.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Code</label>
                <p className="text-gray-900">{vendor.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className={vendor.is_active === "1" ? "text-green-600" : "text-red-600"}>
                  {vendor.is_active === "1" ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <p className="text-gray-900">
                  {new Date(vendor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
                <p className="text-sm text-gray-600">Total Contracts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {contracts.filter(c => c.is_active === "1").length}
                </p>
                <p className="text-sm text-gray-600">Active Contracts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {new Set(contracts.map(c => c.facility_code)).size}
                </p>
                <p className="text-sm text-gray-600">Facilities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Contracts</h2>
        </div>
        <div className="p-6">
          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📄</div>
              <p className="text-gray-600">No contracts found for this vendor</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lot
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contract.facility_name}</p>
                          <p className="text-sm text-gray-500">Code: {contract.facility_code}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contract.lot_name}</p>
                          <p className="text-sm text-gray-500">Number: {contract.lot_number}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {contract.services.length} service{contract.services.length !== 1 ? 's' : ''}
                          {contract.services.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {contract.services.slice(0, 3).map((service) => (
                                <span
                                  key={service.service_id}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1"
                                >
                                  {service.service_name}
                                </span>
                              ))}
                              {contract.services.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{contract.services.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            contract.is_active === "1" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {contract.is_active === "1" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/facilities/${contract.facility_code}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Facility
                          </button>
                          <button
                            onClick={() => router.push(`/lots/${contract.lot_number}`)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            View Lot
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
  );
}
