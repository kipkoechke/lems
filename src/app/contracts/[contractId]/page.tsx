"use client";

import { useContract } from "@/features/vendors/useContract";
import { ContractService } from "@/services/apiVendors";
import { useRouter } from "next/navigation";
import React from "react";
import {
  FaArrowLeft,
  FaBox,
  FaBuilding,
  FaCheck,
  FaClock,
  FaMapMarkerAlt,
  FaStethoscope,
  FaTimes,
} from "react-icons/fa";

interface ContractDetailsPageProps {
  params: Promise<{ contractId: string }>;
}

const ContractDetailsPage: React.FC<ContractDetailsPageProps> = ({
  params,
}) => {
  const router = useRouter();
  const [contractId, setContractId] = React.useState<string>("");

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setContractId(resolvedParams.contractId);
    });
  }, [params]);

  const { contract, isLoading, error } = useContract(contractId);

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
                  View contract information and services
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {contract.is_active === "1" ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <FaCheck className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <FaTimes className="w-3 h-3" />
                  Inactive
                </span>
              )}
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
                    Contract ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    {contract.id}
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
                    Lot
                  </label>
                  <p className="text-gray-900 font-semibold flex items-center gap-2">
                    <FaBox className="text-gray-400" />
                    {contract.lot.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Number: {contract.lot.number}
                  </p>
                </div>
              </div>
            </div>

            {/* Services Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaStethoscope className="text-green-600" />
                Contract Services
                <span className="text-sm font-normal text-gray-600">
                  ({contract.services?.length || 0} services)
                </span>
              </h2>

              {contract.services && contract.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contract.services.map(
                    (service: ContractService, index: number) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {service.service_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Code: {service.service_code}
                            </p>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
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
                  {contract.is_active === "1" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheck className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FaTimes className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Services Count</span>
                  <span className="font-semibold text-gray-900">
                    {contract.services?.length || 0}
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
                  onClick={() =>
                    router.push(`/vendors/${contract.vendor.code}/contracts`)
                  }
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaStethoscope />
                  Manage Services
                </button>
                <button
                  onClick={() =>
                    router.push(`/vendors/${contract.vendor.code}`)
                  }
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FaBuilding />
                  View Vendor
                </button>
              </div>
            </div>

            {/* Contract Timeline/History could go here */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaClock className="text-blue-600" />
                Contract Timeline
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Track contract milestones and important dates.
              </p>
              <div className="text-center text-gray-500 text-sm">
                Timeline feature coming soon...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsPage;
