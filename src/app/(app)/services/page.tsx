"use client";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCurrentUser, useCurrentFacility } from "@/hooks/useAuth";
import { useServicesByFacilityCode } from "@/features/services/useServicesByFacilityCode";
import { useContracts } from "@/features/vendors/useContracts";
import { useState, useMemo } from "react";
import { FaStethoscope, FaMoneyBillWave, FaCog } from "react-icons/fa";
import { SearchField } from "@/components/common/SearchField";

export default function ServicesPage() {
  const user = useCurrentUser();
  const facility = useCurrentFacility();
  const [searchTerm, setSearchTerm] = useState("");

  const isVendor = user?.role === "vendor";

  // Get code from user's entity - for vendors use vendor code, for facilities use facility code
  const entityCode = facility?.code || "";

  // For vendors, use contracts API with vendor_code, for facilities use services by facility code
  const { contracts: vendorContracts, isLoading: vendorLoading } = useContracts(
    isVendor
      ? { vendor_code: entityCode, page: 1, per_page: 100 }
      : { page: 1, per_page: 0 }
  );

  const {
    contracts: facilityContracts,
    isServicesLoading: facilityLoading,
    error,
  } = useServicesByFacilityCode(!isVendor ? entityCode : "");

  const isLoading = isVendor ? vendorLoading : facilityLoading;
  const contracts = isVendor ? vendorContracts : facilityContracts;

  // Extract all services from contracts
  const allServices = useMemo(() => {
    if (!contracts) return [];

    return contracts.flatMap((contract: any) => {
      // For vendor contracts, services are in lot.services
      // For facility contracts, services might be at contract.services
      const services = contract.services || contract.lot?.services || [];

      return services.map((service: any) => ({
        ...service,
        // Map different field names
        service_code: service.service_code || service.code,
        service_name: service.service_name || service.name,
        vendorName: contract.vendor?.name || contract.vendor_name || "N/A",
        facilityName:
          contract.facility?.name || contract.facility_name || "N/A",
        lotName: contract.lot?.name || contract.lot_name || "N/A",
      }));
    });
  }, [contracts]);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!searchTerm) return allServices;

    const lowerSearch = searchTerm.toLowerCase();
    return allServices.filter(
      (service: any) =>
        service.service_name?.toLowerCase().includes(lowerSearch) ||
        service.service_code?.toLowerCase().includes(lowerSearch) ||
        service.vendorName?.toLowerCase().includes(lowerSearch)
    );
  }, [allServices, searchTerm]);

  // Calculate revenue statistics for vendor view
  const totalRevenue = useMemo(() => {
    return filteredServices.reduce((acc: number, service: any) => {
      const vendorShare = parseFloat(service.vendor_share || "0");
      return acc + vendorShare;
    }, 0);
  }, [filteredServices]);

  const formatCurrency = (amount: number | string) => {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(value || 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">⚠️</div>
              <p className="text-red-600">
                Error loading services: {error?.message || "Unknown error"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate permission={Permission.VIEW_SERVICES}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaStethoscope className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {isVendor ? "Services & Revenue" : "Services Offered"}
                  </h1>
                  <p className="text-sm md:text-base text-purple-100">
                    {isVendor
                      ? "View services you provide and associated revenue"
                      : "View all services available at your facility"}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        Total Services
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {filteredServices.length}
                      </p>
                    </div>
                    <FaCog className="w-10 h-10 text-purple-400 opacity-50" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Active Contracts
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        {contracts?.length || 0}
                      </p>
                    </div>
                    <FaStethoscope className="w-10 h-10 text-green-400 opacity-50" />
                  </div>
                </div>

                {isVendor && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Vendor Share Total
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {formatCurrency(totalRevenue)}
                        </p>
                      </div>
                      <FaMoneyBillWave className="w-10 h-10 text-blue-400 opacity-50" />
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <SearchField
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by service name, code, or vendor..."
                />
              </div>

              {/* Services Table */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          SHA Rate
                        </th>
                        {isVendor && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor Share
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Facility Share
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredServices.map((service: any, index: number) => (
                        <tr
                          key={`${service.service_id}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {service.service_code || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {service.service_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(service.sha_rate || 0)}
                          </td>
                          {isVendor && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                              {formatCurrency(service.vendor_share || 0)}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(service.facility_share || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {service.lotName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                service.is_active === "1" ||
                                service.is_active === true
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {service.is_active === "1" ||
                              service.is_active === true
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredServices.length === 0 && (
                  <div className="text-center py-12">
                    <FaStethoscope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No services found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
