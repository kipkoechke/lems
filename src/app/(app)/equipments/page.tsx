"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCog,
  FaPlus,
  FaSearch,
  FaWrench,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaEdit,
} from "react-icons/fa";
import { useAdminEquipments } from "@/features/vendors/useAdminEquipments";
import type { AdminEquipment } from "@/services/apiEquipment";
import { Table } from "@/components/Table";
import { ActionMenu } from "@/components/common/ActionMenu";
import Pagination from "@/components/common/Pagination";
import { ErrorState } from "@/components/common/ErrorState";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-700 border-slate-200",
  decommissioned: "bg-red-50 text-red-700 border-red-200",
  pending_installation: "bg-blue-50 text-blue-700 border-blue-200",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <FaCheckCircle className="w-3 h-3" />;
    case "maintenance":
      return <FaWrench className="w-3 h-3" />;
    case "decommissioned":
      return <FaTimesCircle className="w-3 h-3" />;
    case "pending_installation":
      return <FaClock className="w-3 h-3" />;
    default:
      return null;
  }
};

export default function EquipmentsPage() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalityFilter, setModalityFilter] = useState("");

  const { equipments, pagination, availableFilters, isLoading, error, refetch } =
    useAdminEquipments({
      page,
      per_page: 15,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      modality: modalityFilter || undefined,
      search: search || undefined,
    });

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 p-8 animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Equipment"
        error={error}
        action={{ label: "Try Again", onClick: () => refetch() }}
        fullScreen
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaCog className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Equipment</h1>
              <p className="text-sm text-slate-500">
                {pagination?.total || 0} equipment items
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/equipments/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <FaPlus className="w-3 h-3" /> Add Equipment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, code, serial number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px] bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
              <option value="decommissioned">Decommissioned</option>
              <option value="pending_installation">Pending Installation</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[150px] bg-white"
            >
              <option value="">All Categories</option>
              {availableFilters?.modalities?.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 hidden md:block overflow-hidden">
          <Table className="w-full">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Code</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Category</Table.HeaderCell>
                <Table.HeaderCell>Vendor</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {equipments.length === 0 ? (
                <Table.Empty colSpan={6}>No equipment found</Table.Empty>
              ) : (
                equipments.map((eq: AdminEquipment) => (
                  <Table.Row key={eq.id}>
                    <Table.Cell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                        {eq.code}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="font-medium text-slate-900">{eq.name}</div>
                      {eq.serial_number && (
                        <div className="text-xs text-slate-500 font-mono">
                          S/N: {eq.serial_number}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">{eq.category_label}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-slate-700">
                        {eq.vendor?.name || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          STATUS_BADGE[eq.status] ?? "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {getStatusIcon(eq.status)}
                        {eq.status_label}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <ActionMenu menuId={`equipment-${eq.id}`}>
                        <ActionMenu.Trigger />
                        <ActionMenu.Content>
                          <ActionMenu.Item
                            onClick={() => router.push(`/equipments/${eq.id}`)}
                          >
                            <FaEye className="text-blue-500" /> View
                          </ActionMenu.Item>
                          <ActionMenu.Item
                            onClick={() => router.push(`/equipments/${eq.id}/edit`)}
                          >
                            <FaEdit className="text-amber-500" /> Edit
                          </ActionMenu.Item>
                        </ActionMenu.Content>
                      </ActionMenu>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={setPage}
            />
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {equipments.map((eq: AdminEquipment) => (
            <div
              key={eq.id}
              className="bg-white rounded-lg border border-slate-200 p-4"
              onClick={() => router.push(`/equipments/${eq.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {eq.code}
                  </span>
                  <h3 className="font-semibold text-slate-900 mt-2">{eq.name}</h3>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                    STATUS_BADGE[eq.status] ?? "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {getStatusIcon(eq.status)}
                  {eq.status_label}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category</span>
                  <span className="text-slate-900">{eq.category_label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vendor</span>
                  <span className="text-slate-900">{eq.vendor?.name || "-"}</span>
                </div>
                {eq.serial_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serial</span>
                    <span className="text-slate-900 font-mono text-xs">{eq.serial_number}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
