"use client";

import React, { useMemo, useRef, useState } from "react";
import { useEquipments } from "@/features/equipments/useEquipments";
import { useCreateEquipment } from "@/features/equipments/useCreateEquipment";
import { useUpdateEquipment } from "@/features/equipments/useUpdateEquipment";
import { useDeleteEquipment } from "@/features/equipments/useDeleteEquipment";
import { useVendors } from "@/features/vendors/useVendors";
import LocationFilters from "@/components/LocationFilters";
import {
  Equipment,
  EquipmentCreateRequest,
  EquipmentUpdateRequest,
} from "@/services/apiEquipment";
import {
  FaCogs,
  FaEllipsisV,
  FaEdit,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";

type ModalType = "create" | "edit";

const Equipments: React.FC = () => {
  const { equipments = [], isLoading, error } = useEquipments();
  const { createEquipment, isCreating } = useCreateEquipment();
  const { updateEquipment, isUpdating } = useUpdateEquipment();
  const { deleteEquipment, isDeleting } = useDeleteEquipment();
  const { vendors = [], isLoading: vendorsLoading } = useVendors();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [locationFilters, setLocationFilters] = useState<{
    county_id?: string;
    sub_county_id?: string;
    ward_id?: string;
    facility_id?: string;
  }>({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("create");
  const [form, setForm] = useState<EquipmentCreateRequest>({
    name: "",
    description: "",
    serial_number: "",
    model: "",
    manufacturer: "",
    year: "",
    status: "available",
    vendor_id: "",
  });
  const [selected, setSelected] = useState<Equipment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  // Searchable vendor dropdown state
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const vendorSearchRef = useRef<HTMLInputElement>(null);

  const filteredVendors = useMemo(() => {
    const q = vendorSearch.toLowerCase();
    return vendors
      ?.filter(
        (v) =>
          v.name?.toLowerCase().includes(q) || v.code?.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [vendors, vendorSearch]);

  const selectedVendor = useMemo(
    () => vendors?.find((v) => v.id === form.vendor_id),
    [vendors, form.vendor_id]
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (equipments as Equipment[]).filter((e: Equipment) => {
      const matchesSearch =
        !s ||
        e.name?.toLowerCase().includes(s) ||
        e.serial_number?.toLowerCase().includes(s) ||
        e.manufacturer?.toLowerCase().includes(s) ||
        e.model?.toLowerCase().includes(s) ||
        e.vendor?.name?.toLowerCase().includes(s) ||
        e.vendor_id?.toLowerCase?.()?.includes?.(s);
      const matchesStatus = status === "all" || e.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [equipments, search, status]);

  const openCreate = () => {
    setModalType("create");
    setSelected(null);
    setForm({
      name: "",
      description: "",
      serial_number: "",
      model: "",
      manufacturer: "",
      year: "",
      status: "available",
      vendor_id: "",
    });
    setShowModal(true);
  };

  const openEdit = (e: Equipment) => {
    setModalType("edit");
    setSelected(e);
    setForm({
      name: e.name,
      description: e.description ?? "",
      serial_number: e.serial_number,
      model: e.model ?? "",
      manufacturer: e.manufacturer ?? "",
      year: (e.year as any) ?? "",
      status: e.status,
      vendor_id: e.vendor_id,
    });
    setShowModal(true);
    setActiveDropdown(null);
    setIsVendorDropdownOpen(false);
    setVendorSearch("");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setIsVendorDropdownOpen(false);
    setVendorSearch("");
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (modalType === "create") {
      createEquipment(form, {
        onSuccess: () => closeModal(),
      });
    } else if (modalType === "edit" && selected) {
      const payload: EquipmentUpdateRequest = { id: selected.id, ...form };
      updateEquipment(payload, { onSuccess: () => closeModal() });
    }
  };

  const onDelete = (id: string) => {
    setShowDeleteConfirm(id);
    setActiveDropdown(null);
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;
    deleteEquipment(showDeleteConfirm, {
      onSuccess: () => setShowDeleteConfirm(null),
    });
  };

  const statusBadge = (value: string) => {
    const map: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      unavailable: "bg-red-100 text-red-800",
      retired: "bg-gray-100 text-gray-800",
    };
    const cls = map[value] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cls}`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 text-xl mb-4">
              Error loading equipments
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6 overflow-visible">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaCogs className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Equipment Management
                  </h1>
                  <p className="text-sm md:text-base text-blue-100">
                    Manage medical equipment
                  </p>
                </div>
              </div>
              <button
                onClick={openCreate}
                className="bg-white/20 hover:bg-white/30 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
              >
                <FaPlus /> Add Equipment
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 md:p-6 bg-gray-50 border-b space-y-4 overflow-visible">
            {/* Location Filters */}
            <LocationFilters
              onLocationChange={setLocationFilters}
              showFacilityFilter={true}
            />

            {/* Search and Status Filters */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, serial, model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>
              <div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl hidden md:block">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Serial
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Model
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Manufacturer
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No equipments found
                    </td>
                  </tr>
                ) : (
                  filtered.map((e: Equipment) => (
                    <tr
                      key={e.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-sm bg-gray-50 rounded">
                        {e.serial_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {e.name}
                        </div>
                        {e.description && (
                          <div className="text-sm text-gray-600 line-clamp-1">
                            {e.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {e.model || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {e.manufacturer || "-"}
                      </td>
                      <td className="px-6 py-4">{statusBadge(e.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {e.vendor?.name || e.vendor_id}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === e.id ? null : e.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaEllipsisV />
                          </button>

                          {activeDropdown === e.id && (
                            <>
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveDropdown(null)}
                              ></div>
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                                <div className="p-1">
                                  <button
                                    onClick={() => openEdit(e)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaEdit className="text-yellow-500" /> Edit
                                  </button>
                                  <button
                                    onClick={() => onDelete(e.id)}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                  >
                                    <FaTrash className="text-red-500" /> Delete
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              No equipments found
            </div>
          ) : (
            filtered.map((e: Equipment) => (
              <div
                key={e.id}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {e.name}
                    </h3>
                    <div className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-600 mb-2">
                      {e.serial_number}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(e.status)}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === e.id ? null : e.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FaEllipsisV />
                      </button>

                      {activeDropdown === e.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                            <div className="p-1">
                              <button
                                onClick={() => openEdit(e)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                <FaEdit className="text-yellow-500" /> Edit
                              </button>
                              <button
                                onClick={() => onDelete(e.id)}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                              >
                                <FaTrash className="text-red-500" /> Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {e.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {e.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Model:</span>
                    <p className="text-gray-900">{e.model || "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">
                      Manufacturer:
                    </span>
                    <p className="text-gray-900">{e.manufacturer || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 font-medium">Vendor:</span>
                    <p className="text-gray-900">
                      {e.vendor?.name || e.vendor_id || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filtered.length > 0 && (
          <div className="mt-4 md:mt-6 bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 md:hidden">
              Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from(
                filtered.reduce((acc, cur) => {
                  acc.set(cur.status, (acc.get(cur.status) || 0) + 1);
                  return acc;
                }, new Map<string, number>())
              ).map(([k, v]) => (
                <div key={k} className="text-center p-3 md:p-0">
                  <div className="mb-2">{statusBadge(k)}</div>
                  <div className="text-xl md:text-2xl font-bold text-gray-800">
                    {v}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 md:hidden">
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-3 md:p-4 transition-all duration-300">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-lg md:text-xl font-bold text-white">
                {modalType === "create" ? "Add Equipment" : "Edit Equipment"}
              </h2>
            </div>
            <form
              onSubmit={onSubmit}
              className="p-4 md:p-6 space-y-4 md:space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    placeholder="Equipment name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    value={form.serial_number}
                    onChange={(e) =>
                      setForm({ ...form, serial_number: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    placeholder="Serial number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    value={form.model ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    placeholder="Model"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    value={form.manufacturer ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, manufacturer: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    placeholder="Manufacturer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={form.year as any}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    placeholder="Year"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor
                  </label>
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVendorDropdownOpen(!isVendorDropdownOpen);
                        if (!isVendorDropdownOpen) {
                          setTimeout(
                            () => vendorSearchRef.current?.focus(),
                            100
                          );
                        }
                      }}
                      disabled={vendorsLoading}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                    >
                      <span
                        className={
                          selectedVendor ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {vendorsLoading
                          ? "Loading vendors..."
                          : selectedVendor
                          ? `${selectedVendor.name} (${selectedVendor.code})`
                          : "Select a vendor"}
                      </span>
                      <FaChevronDown
                        className={`text-gray-400 transition-transform ${
                          isVendorDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isVendorDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                        <div className="p-3 md:p-4 border-b border-gray-100">
                          <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              ref={vendorSearchRef}
                              type="text"
                              placeholder="Search vendors..."
                              value={vendorSearch}
                              onChange={(e) => setVendorSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm md:text-base"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredVendors && filteredVendors.length > 0 ? (
                            filteredVendors.map((v) => (
                              <div
                                key={v.id}
                                className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setForm({ ...form, vendor_id: v.id });
                                  setIsVendorDropdownOpen(false);
                                  setVendorSearch("");
                                }}
                              >
                                <div className="font-semibold text-gray-900 text-sm md:text-base">
                                  {v.name}
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">
                                  Code: {v.code}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
                              {vendorsLoading
                                ? "Loading vendors..."
                                : "No vendors found"}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description (below Vendor) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    placeholder="Description (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-4 md:pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full md:flex-1 px-4 py-2 md:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-full md:flex-1 px-4 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 text-sm md:text-base"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : modalType === "create"
                    ? "Create"
                    : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-3 md:p-4 transition-all duration-300">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-4 md:p-6">
              <div className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Delete Equipment
                </h3>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  Are you sure you want to delete this equipment? This action
                  cannot be undone.
                </p>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="w-full md:flex-1 px-4 py-2 md:py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="w-full md:flex-1 px-4 py-2 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm md:text-base"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipments;
