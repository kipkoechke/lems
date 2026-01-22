"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MdBusiness,
  MdCalendarToday,
  MdHandshake,
  MdLocationCity,
  MdCheckCircle,
} from "react-icons/md";
import { FaEdit, FaFileContract, FaCog } from "react-icons/fa";
import { useVendor } from "@/features/vendors/useVendor";
import { getContracts } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/components/common/BackButton";
import { Table } from "@/components/Table";
import { ErrorState } from "@/components/common/ErrorState";

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vendorCode = params.vendorCode as string;

  const {
    vendor,
    isLoading: vendorLoading,
    error: vendorError,
  } = useVendor(vendorCode);

  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ["contracts", vendorCode],
    queryFn: () => getContracts({ vendor_code: vendorCode }),
    enabled: !!vendorCode,
  });

  const contracts = contractsData?.data || [];

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
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "expired":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (vendorLoading || contractsLoading) {
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

  if (vendorError || !vendor) {
    return (
      <ErrorState
        title="Unable to Load Vendor"
        error={vendorError}
        message={!vendorError && !vendor ? "Vendor not found" : undefined}
        action={{
          label: "Back to Vendors",
          onClick: () => router.push("/vendors"),
        }}
        fullScreen
      />
    );
  }

  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const uniqueFacilities = new Set(contracts.map((c) => c.facility.code)).size;

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
                  {vendor.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    vendor.is_active === "1"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  <MdCheckCircle className="w-3.5 h-3.5" />
                  {vendor.is_active === "1" ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-mono">{vendor.code}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/vendors/${vendorCode}/equipments`)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
            >
              <FaCog className="w-4 h-4" /> Equipment
            </button>
            <button
              onClick={() => router.push(`/vendors/${vendorCode}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <FaEdit className="w-4 h-4" /> Edit
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <MdBusiness className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Vendor Code</p>
              <p className="text-sm font-medium text-slate-900 font-mono truncate">
                {vendor.code}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <MdHandshake className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Active Contracts</p>
              <p className="text-sm font-medium text-slate-900">
                {activeContracts} of {contracts.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <MdLocationCity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Facilities</p>
              <p className="text-sm font-medium text-slate-900">
                {uniqueFacilities}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <MdCalendarToday className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm font-medium text-slate-900 truncate">
                {formatDate(vendor.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg border border-slate-200">
          {/* Contracts Section */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaFileContract className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Contracts ({contracts.length})
                </h2>
              </div>
              <button
                onClick={() =>
                  router.push(`/contracts/new?vendor=${vendorCode}`)
                }
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Contract
              </button>
            </div>

            {contracts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                  <FaFileContract className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No contracts found</p>
                <button
                  onClick={() =>
                    router.push(`/contracts/new?vendor=${vendorCode}`)
                  }
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create first contract
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Contract #</Table.HeaderCell>
                      <Table.HeaderCell>Facility</Table.HeaderCell>
                      <Table.HeaderCell>Period</Table.HeaderCell>
                      <Table.HeaderCell>Status</Table.HeaderCell>
                      <Table.HeaderCell align="right">Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {contracts.slice(0, 5).map((contract) => (
                      <Table.Row key={contract.id}>
                        <Table.Cell>
                          <span className="font-medium text-slate-900">
                            {contract.contract_number}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <p className="text-sm text-slate-900">
                              {contract.facility.name}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {contract.facility.code}
                            </p>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <p className="text-sm text-slate-700">
                            {formatDate(contract.start_date)} -{" "}
                            {formatDate(contract.end_date)}
                          </p>
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                              contract.status,
                            )}`}
                          >
                            {contract.status.charAt(0).toUpperCase() +
                              contract.status.slice(1)}
                          </span>
                        </Table.Cell>
                        <Table.Cell align="right">
                          <button
                            onClick={() =>
                              router.push(`/contracts/${contract.id}`)
                            }
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View
                          </button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
                {contracts.length > 5 && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() =>
                        router.push(`/vendors/${vendorCode}/contracts`)
                      }
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all {contracts.length} contracts →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="px-4 py-3 bg-slate-50 rounded-b-lg">
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Created: {formatDate(vendor.created_at)}</span>
              <span>Updated: {formatDate(vendor.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
