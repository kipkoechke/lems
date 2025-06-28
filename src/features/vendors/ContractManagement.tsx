"use client";

import { useFacilities } from "@/features/facilities/useFacilities";
import { useLots } from "@/features/lots/useLots";
import { Contract, ContractFilterParams } from "@/services/apiVendors";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaChevronDown,
  FaEllipsisV,
  FaEye,
  FaFileContract,
  FaFilter,
  FaPlus,
  FaSearch,
  FaStethoscope,
  FaTimes,
} from "react-icons/fa";
import { useContracts } from "./useContracts";
import { useCreateContract } from "./useCreateContract";
import { useUpdateContractServices } from "./useUpdateContractServices";
import { useVendors } from "./useVendors";

interface ContractFormData {
  vendor_code: string;
  facility_code: string;
  lot_number: string;
  is_active: string;
}

interface ContractServicesFormData {
  contract_id: string;
  services: string[];
}

interface ContractManagementProps {
  vendorCode?: string;
}

const ContractManagement: React.FC<ContractManagementProps> = ({
  vendorCode,
}) => {
  const router = useRouter();
  const [filters, setFilters] = useState<ContractFilterParams>({
    vendor_code: vendorCode,
  });

  const { contracts, isLoading, error, refetch } = useContracts(filters);
  const { createContract, isCreating } = useCreateContract();
  const { updateContractServices, isUpdating } = useUpdateContractServices();
  const { facilities, isLoading: facilitiesLoading } = useFacilities();
  const { vendors, isLoading: vendorsLoading } = useVendors();
  const { lots, isLoading: lotsLoading } = useLots();

  // State management
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit" | "services">(
    "create"
  );
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Searchable dropdown states
  const [vendorSearch, setVendorSearch] = useState<string>("");
  const [facilitySearch, setFacilitySearch] = useState<string>("");
  const [lotSearch, setLotSearch] = useState<string>("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [isLotDropdownOpen, setIsLotDropdownOpen] = useState(false);

  // Search refs
  const vendorSearchRef = useRef<HTMLInputElement>(null);
  const facilitySearchRef = useRef<HTMLInputElement>(null);
  const lotSearchRef = useRef<HTMLInputElement>(null);

  // Form state
  const [contractFormData, setContractFormData] = useState<ContractFormData>({
    vendor_code: vendorCode || "",
    facility_code: "",
    lot_number: "",
    is_active: "1",
  });

  const [servicesFormData, setServicesFormData] =
    useState<ContractServicesFormData>({
      contract_id: "",
      services: [],
    });

  // Filter contracts based on search and status
  const filteredContracts = contracts?.filter((contract) => {
    const matchesSearch =
      contract.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.lot_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && contract.is_active === "1") ||
      (statusFilter === "inactive" && contract.is_active === "0");

    return matchesSearch && matchesStatus;
  });

  // Filter data based on search terms
  const filteredVendors = vendors
    ?.filter(
      (vendor) =>
        vendor.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        vendor.code?.toLowerCase().includes(vendorSearch.toLowerCase())
    )
    .slice(0, 50);

  const filteredFacilitiesDropdown = facilities
    ?.filter(
      (facility) =>
        facility.name?.toLowerCase().includes(facilitySearch.toLowerCase()) ||
        facility.code?.toLowerCase().includes(facilitySearch.toLowerCase())
    )
    .slice(0, 50);

  const filteredLots = lots
    ?.filter(
      (lot) =>
        lot.name?.toLowerCase().includes(lotSearch.toLowerCase()) ||
        lot.number?.toLowerCase().includes(lotSearch.toLowerCase())
    )
    .slice(0, 50);

  // Get selected items
  const selectedVendor = vendors?.find((v) => v.code === contractFormData.vendor_code);
  const selectedFacilityDropdown = facilities?.find((f) => f.code === contractFormData.facility_code);
  const selectedLot = lots?.find((l) => l.number === contractFormData.lot_number);

  // Form handlers
  const resetForm = () => {
    setContractFormData({
      vendor_code: vendorCode || "",
      facility_code: "",
      lot_number: "",
      is_active: "1",
    });
    setServicesFormData({
      contract_id: "",
      services: [],
    });
    setSelectedContract(null);
    // Clear search states
    setVendorSearch("");
    setFacilitySearch("");
    setLotSearch("");
    setIsVendorDropdownOpen(false);
    setIsFacilityDropdownOpen(false);
    setIsLotDropdownOpen(false);
  };

  const openModal = (
    type: "create" | "edit" | "services",
    contract?: Contract
  ) => {
    setModalType(type);
    if (contract) {
      setSelectedContract(contract);
      setContractFormData({
        vendor_code: contract.vendor_code,
        facility_code: contract.facility_code,
        lot_number: contract.lot_number,
        is_active: contract.is_active,
      });
      setServicesFormData({
        contract_id: contract.id,
        services: contract.services.map((s) => s.service_code),
      });
    } else {
      resetForm();
    }
    setShowModal(true);
    setActiveDropdown(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === "create") {
      createContract(contractFormData, {
        onSuccess: () => {
          closeModal();
          refetch();
        },
      });
    }
  };

  const handleServicesSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateContractServices(servicesFormData, {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    });
  };

  const handleFilterChange = (
    key: keyof ContractFilterParams,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // Dropdown handlers
  const handleVendorSelect = (vendor: any) => {
    setContractFormData(prev => ({...prev, vendor_code: vendor.code}));
    setIsVendorDropdownOpen(false);
    setVendorSearch("");
  };

  const handleFacilitySelectDropdown = (facility: any) => {
    setContractFormData(prev => ({...prev, facility_code: facility.code}));
    setIsFacilityDropdownOpen(false);
    setFacilitySearch("");
  };

  const handleLotSelect = (lot: any) => {
    setContractFormData(prev => ({...prev, lot_number: lot.number}));
    setIsLotDropdownOpen(false);
    setLotSearch("");
  };

  const toggleVendorDropdown = () => {
    setIsVendorDropdownOpen(!isVendorDropdownOpen);
    setIsFacilityDropdownOpen(false);
    setIsLotDropdownOpen(false);
    if (!isVendorDropdownOpen && vendorSearchRef.current) {
      setTimeout(() => vendorSearchRef.current?.focus(), 100);
    }
  };

  const toggleFacilityDropdown = () => {
    setIsFacilityDropdownOpen(!isFacilityDropdownOpen);
    setIsVendorDropdownOpen(false);
    setIsLotDropdownOpen(false);
    if (!isFacilityDropdownOpen && facilitySearchRef.current) {
      setTimeout(() => facilitySearchRef.current?.focus(), 100);
    }
  };

  const toggleLotDropdown = () => {
    setIsLotDropdownOpen(!isLotDropdownOpen);
    setIsVendorDropdownOpen(false);
    setIsFacilityDropdownOpen(false);
    if (!isLotDropdownOpen && lotSearchRef.current) {
      setTimeout(() => lotSearchRef.current?.focus(), 100);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setIsVendorDropdownOpen(false);
        setIsFacilityDropdownOpen(false);
        setIsLotDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
              Error loading contracts
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {vendorCode && (
                  <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FaArrowLeft className="w-5 h-5 text-white" />
                  </button>
                )}
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileContract className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {vendorCode
                      ? `Vendor ${vendorCode} Contracts`
                      : "Contract Management"}
                  </h1>
                  <p className="text-purple-100">
                    Manage vendor facility contracts and services
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal("create")}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <FaPlus /> Add Contract
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {!vendorCode && (
                <input
                  type="text"
                  placeholder="Vendor Code"
                  value={filters.vendor_code || ""}
                  onChange={(e) =>
                    handleFilterChange("vendor_code", e.target.value)
                  }
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}

              <input
                type="text"
                placeholder="Facility Code"
                value={filters.facility_code || ""}
                onChange={(e) =>
                  handleFilterChange("facility_code", e.target.value)
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                type="text"
                placeholder="Lot Number"
                value={filters.lot_number || ""}
                onChange={(e) =>
                  handleFilterChange("lot_number", e.target.value)
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Facility
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Lot
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Services
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContracts?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchTerm || statusFilter !== "all"
                        ? "No contracts match your search criteria"
                        : "No contracts found. Create your first contract!"}
                    </td>
                  </tr>
                ) : (
                  filteredContracts?.map((contract) => (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {contract.vendor_name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {contract.vendor_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {contract.facility_name}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {contract.facility_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            LOT {contract.lot_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contract.lot_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {contract.services.length} services
                          </span>
                          <span className="text-sm text-gray-500">
                            (
                            {
                              contract.services.filter(
                                (s) => s.is_active === "1"
                              ).length
                            }{" "}
                            active)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            contract.is_active === "1"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {contract.is_active === "1" ? (
                            <FaCheck />
                          ) : (
                            <FaTimes />
                          )}
                          {contract.is_active === "1" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === contract.id
                                  ? null
                                  : contract.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <FaEllipsisV />
                          </button>

                          {activeDropdown === contract.id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveDropdown(null)}
                              ></div>

                              {/* Dropdown menu */}
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                                <div className="p-1">
                                  <button
                                    onClick={() =>
                                      router.push(`/contracts/${contract.id}`)
                                    }
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaEye className="text-blue-500" /> View
                                    Details
                                  </button>
                                  <button
                                    onClick={() =>
                                      openModal("services", contract)
                                    }
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                                  >
                                    <FaStethoscope className="text-green-500" />{" "}
                                    Manage Services
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

        {/* Summary */}
        {filteredContracts && filteredContracts.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredContracts.length}
                </div>
                <div className="text-sm text-gray-600">Total Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredContracts.filter((c) => c.is_active === "1").length}
                </div>
                <div className="text-sm text-gray-600">Active Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredContracts.reduce(
                    (sum, c) => sum + c.services.length,
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Services</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/View */}
      {showModal && modalType !== "services" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                {modalType === "create"
                  ? "Add New Contract"
                  : "Contract Details"}
              </h2>
            </div>

            <form onSubmit={handleContractSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={toggleVendorDropdown}
                    disabled={!!vendorCode || vendorsLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className={selectedVendor ? "text-gray-900" : "text-gray-500"}>
                      {vendorsLoading
                        ? "Loading vendors..."
                        : selectedVendor
                        ? `${selectedVendor.name} (${selectedVendor.code})`
                        : "Select a vendor"}
                    </span>
                    <FaChevronDown className={`text-gray-400 transition-transform ${isVendorDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isVendorDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            ref={vendorSearchRef}
                            type="text"
                            placeholder="Search vendors..."
                            value={vendorSearch}
                            onChange={(e) => setVendorSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredVendors && filteredVendors.length > 0 ? (
                          filteredVendors.map((vendor) => (
                            <div
                              key={vendor.id}
                              className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                              onClick={() => handleVendorSelect(vendor)}
                            >
                              <div className="font-semibold text-gray-900">
                                {vendor.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Code: {vendor.code}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No vendors found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facility
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={toggleFacilityDropdown}
                    disabled={facilitiesLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className={selectedFacilityDropdown ? "text-gray-900" : "text-gray-500"}>
                      {facilitiesLoading
                        ? "Loading facilities..."
                        : selectedFacilityDropdown
                        ? `${selectedFacilityDropdown.name} (${selectedFacilityDropdown.code})`
                        : "Select a facility"}
                    </span>
                    <FaChevronDown className={`text-gray-400 transition-transform ${isFacilityDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isFacilityDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            ref={facilitySearchRef}
                            type="text"
                            placeholder="Search facilities..."
                            value={facilitySearch}
                            onChange={(e) => setFacilitySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredFacilitiesDropdown && filteredFacilitiesDropdown.length > 0 ? (
                          filteredFacilitiesDropdown.map((facility) => (
                            <div
                              key={facility.id}
                              className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                              onClick={() => handleFacilitySelectDropdown(facility)}
                            >
                              <div className="font-semibold text-gray-900">
                                {facility.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Code: {facility.code}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No facilities found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lot
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={toggleLotDropdown}
                    disabled={lotsLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className={selectedLot ? "text-gray-900" : "text-gray-500"}>
                      {lotsLoading
                        ? "Loading lots..."
                        : selectedLot
                        ? `${selectedLot.name} (Lot ${selectedLot.number})`
                        : "Select a lot"}
                    </span>
                    <FaChevronDown className={`text-gray-400 transition-transform ${isLotDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isLotDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            ref={lotSearchRef}
                            type="text"
                            placeholder="Search lots..."
                            value={lotSearch}
                            onChange={(e) => setLotSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredLots && filteredLots.length > 0 ? (
                          filteredLots.map((lot) => (
                            <div
                              key={lot.id}
                              className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                              onClick={() => handleLotSelect(lot)}
                            >
                              <div className="font-semibold text-gray-900">
                                {lot.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Lot Number: {lot.number}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No lots found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={contractFormData.is_active}
                  onChange={(e) =>
                    setContractFormData({
                      ...contractFormData,
                      is_active: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={false}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>{" "}
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services Management Modal */}
      {showModal && modalType === "services" && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Manage Contract Services
              </h2>
              <p className="text-green-100 text-sm">
                {selectedContract.vendor_name} -{" "}
                {selectedContract.facility_name}
              </p>
            </div>

            <form onSubmit={handleServicesSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Services
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {selectedContract.services.map((service) => (
                    <div
                      key={service.service_id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div>
                        <span className="font-medium">
                          {service.service_name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({service.service_code})
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          service.is_active === "1"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {service.is_active === "1" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Service Codes
                </label>
                <textarea
                  value={servicesFormData.services.join("\n")}
                  onChange={(e) =>
                    setServicesFormData({
                      ...servicesFormData,
                      services: e.target.value
                        .split("\n")
                        .filter((s) => s.trim()),
                    })
                  }
                  placeholder="Enter service codes, one per line..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Enter one service code per line. This will replace all current
                  services.
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Services"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
