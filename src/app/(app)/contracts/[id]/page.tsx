"use client";

import { useContract } from "@/features/vendors/useContract";
import { useContractServices } from "@/features/vendors/useContractServices";
import {
  ContractLotWithServices,
  ContractServiceItem,
} from "@/services/apiVendors";
import { useRouter } from "next/navigation";
import React from "react";
import {
  FaArrowLeft,
  FaBox,
  FaBuilding,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaMapMarkerAlt,
  FaStethoscope,
  FaTimes,
} from "react-icons/fa";

interface ContractDetailsPageProps {
  params: Promise<{ id: string }>;
}

const ContractDetailsPage: React.FC<ContractDetailsPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const [contractId, setContractId] = React.useState<string>("");

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setContractId(resolvedParams.id);
    });
  }, [params]);

  const { contract, isLoading, error } = useContract(contractId);
  const {
    totalServices,
    lotsWithServices,
    isLoading: servicesLoading,
  } = useContractServices(contractId);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get status badge styles
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; icon: React.ReactNode }> =
      {
        active: {
          bg: "bg-green-100 text-green-800",
          icon: <FaCheck className="w-3 h-3" />,
        },
        inactive: {
          bg: "bg-gray-100 text-gray-800",
          icon: <FaTimes className="w-3 h-3" />,
        },
        expired: {
          bg: "bg-red-100 text-red-800",
          icon: <FaTimes className="w-3 h-3" />,
        },
        pending: {
          bg: "bg-yellow-100 text-yellow-800",
          icon: <FaClock className="w-3 h-3" />,
        },
      };
    return statusConfig[status] || statusConfig.inactive;
  };

  if (!contractId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Contract
          </h2>
          <p className="text-gray-600 mb-4">Failed to load contract details</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Contract Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested contract could not be found
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(contract.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Contract Details
                </h1>
                <p className="text-gray-600">
                  {contract.contract_number ||
                    `Contract #${contract.id.slice(0, 8)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge.bg}`}
              >
                {statusBadge.icon}
                {contract.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contract Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBuilding className="text-blue-600" />
                Contract Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Number
                  </label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    {contract.contract_number || contract.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {contract.vendor.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Code: {contract.vendor.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facility
                  </label>
                  <p className="text-gray-900 font-semibold flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {contract.facility.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Code: {contract.facility.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Period
                  </label>
                  <p className="text-gray-900 font-semibold flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    {formatDate(contract.start_date)} -{" "}
                    {formatDate(contract.end_date)}
                  </p>
                </div>
                {contract.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {contract.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Services Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaStethoscope className="text-green-600" />
                Contract Services
                <span className="text-sm font-normal text-gray-600">
                  ({totalServices} services)
                </span>
              </h2>

              {servicesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading services...</p>
                </div>
              ) : lotsWithServices && lotsWithServices.length > 0 ? (
                <div className="space-y-6">
                  {lotsWithServices.map((lotGroup: ContractLotWithServices) => (
                    <div
                      key={lotGroup.lot.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FaBox className="text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            LOT {lotGroup.lot.number}
                          </span>
                          <span className="text-gray-500">-</span>
                          <span className="text-gray-700">
                            {lotGroup.lot.name}
                          </span>
                          <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            {lotGroup.services.length} services
                          </span>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {lotGroup.services.map(
                          (service: ContractServiceItem) => (
                            <div
                              key={service.id}
                              className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-lg p-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                    {service.service.name}
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    Code: {service.service.code}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Tariff: KES{" "}
                                    {service.service.tariff?.toLocaleString() ||
                                      0}
                                  </p>
                                  {service.equipment && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Equipment: {service.equipment.name}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    service.is_active
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {service.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaStethoscope className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Services Assigned
                  </h3>
                  <p className="text-gray-600">
                    This contract doesn&apos;t have any services assigned yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${statusBadge.bg}`}
                  >
                    {statusBadge.icon}
                    {contract.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Start Date</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {formatDate(contract.start_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">End Date</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {formatDate(contract.end_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Services Count</span>
                  <span className="font-semibold text-gray-900">
                    {totalServices}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lots</span>
                  <span className="font-semibold text-gray-900">
                    {lotsWithServices.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/vendors`)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaBuilding />
                  View Vendors
                </button>
                <button
                  onClick={() => router.push(`/contracts`)}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FaStethoscope />
                  All Contracts
                </button>
              </div>
            </div>

            {/* Contract Timeline */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaClock className="text-blue-600" />
                Contract Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {formatDate(contract.created_at)}
                  </span>
                </div>
                {contract.creator && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Created By</span>
                    <span className="text-gray-900">
                      {contract.creator.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {formatDate(contract.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsPage;
