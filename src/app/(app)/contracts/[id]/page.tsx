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
  MdBusiness,
  MdCalendarToday,
  MdLocationOn,
  MdCheckCircle,
  MdCancel,
  MdAccessTime,
  MdMedicalServices,
  MdInventory2,
} from "react-icons/md";
import { FaEdit, FaFileContract, FaBox } from "react-icons/fa";
import BackButton from "@/components/common/BackButton";
import { ErrorState } from "@/components/common/ErrorState";

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return {
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <MdCheckCircle className="w-3.5 h-3.5" />,
        };
      case "expired":
        return {
          className: "bg-red-50 text-red-700 border-red-200",
          icon: <MdCancel className="w-3.5 h-3.5" />,
        };
      case "pending":
        return {
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <MdAccessTime className="w-3.5 h-3.5" />,
        };
      default:
        return {
          className: "bg-slate-50 text-slate-700 border-slate-200",
          icon: <MdCancel className="w-3.5 h-3.5" />,
        };
    }
  };

  if (!contractId || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-lg"></div>
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <ErrorState
        title="Unable to Load Contract"
        error={error}
        message={!error && !contract ? "Contract not found" : undefined}
        action={{
          label: "Back to Contracts",
          onClick: () => router.push("/contracts"),
        }}
        fullScreen
      />
    );
  }

  const statusBadge = getStatusBadge(contract.status);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => router.back()} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {contract.contract_number || `Contract #${contract.id.slice(0, 8)}`}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusBadge.className}`}
                >
                  {statusBadge.icon}
                  {contract.status}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {contract.vendor.name} → {contract.facility.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/vendors/${contract.vendor.code}`)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
            >
              <MdBusiness className="w-4 h-4" /> Vendor
            </button>
            <button
              onClick={() => router.push(`/facilities/${contract.facility.code}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <MdLocationOn className="w-4 h-4" /> Facility
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <FaFileContract className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Contract #</p>
              <p className="text-sm font-medium text-slate-900 font-mono truncate">
                {contract.contract_number || contract.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <MdMedicalServices className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Services</p>
              <p className="text-sm font-medium text-slate-900">
                {totalServices} in {lotsWithServices.length} lots
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <MdCalendarToday className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Start Date</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {formatDate(contract.start_date)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <MdAccessTime className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">End Date</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {formatDate(contract.end_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Parties Section */}
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Contract Parties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <MdBusiness className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">Vendor</p>
                  <p className="text-sm font-medium text-slate-900">
                    {contract.vendor.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {contract.vendor.code}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <MdLocationOn className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 mb-0.5">Facility</p>
                  <p className="text-sm font-medium text-slate-900">
                    {contract.facility.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    {contract.facility.code}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {contract.notes && (
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Notes</h2>
              <p className="text-sm text-slate-700">{contract.notes}</p>
            </div>
          )}

          {/* Services Section */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MdMedicalServices className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Services ({totalServices})
                </h2>
              </div>
            </div>

            {servicesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading services...</p>
              </div>
            ) : lotsWithServices && lotsWithServices.length > 0 ? (
              <div className="space-y-4">
                {lotsWithServices.map((lotGroup: ContractLotWithServices) => (
                  <div
                    key={lotGroup.lot.id}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaBox className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-900">
                          LOT {lotGroup.lot.number}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-sm text-slate-600">
                          {lotGroup.lot.name}
                        </span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {lotGroup.services.length} services
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {lotGroup.services.map((service: ContractServiceItem) => (
                          <div
                            key={service.id}
                            className="flex items-start justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {service.service.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500 font-mono">
                                  {service.service.code}
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs text-slate-600">
                                  KES {service.service.tariff?.toLocaleString() || 0}
                                </span>
                              </div>
                              {service.equipment && (
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <MdInventory2 className="w-3 h-3" />
                                  {service.equipment.name}
                                </p>
                              )}
                            </div>
                            <span
                              className={`shrink-0 ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                service.is_active
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {service.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                  <MdMedicalServices className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No services assigned</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="px-4 py-3 bg-slate-50 rounded-b-lg">
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Created: {formatDate(contract.created_at)}</span>
              {contract.creator && (
                <span>By: {contract.creator.name}</span>
              )}
              <span>Updated: {formatDate(contract.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsPage;
