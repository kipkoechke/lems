"use client";

import { useFacilities } from "@/features/facilities/useFacilities";
import { useLots } from "@/features/lots/useLots";
import { useLotWithServices } from "@/features/lots/useLotWithServices";
import { Contract, ContractFilterParams } from "@/services/apiVendors";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaChevronDown,
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

  // Get lot services when a contract is selected for services management
  const selectedLotNumber = selectedContract?.lot_number || "";
  const { services: lotServices, isLoading: lotServicesLoading } =
    useLotWithServices(selectedLotNumber);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Searchable dropdown states
  const [vendorSearch, setVendorSearch] = useState<string>("");
  const [facilitySearch, setFacilitySearch] = useState<string>("");
  const [lotSearch, setLotSearch] = useState<string>("");
  const [serviceSearch, setServiceSearch] = useState<string>("");
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [isLotDropdownOpen, setIsLotDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  // Search refs
  const vendorSearchRef = useRef<HTMLInputElement>(null);
  const facilitySearchRef = useRef<HTMLInputElement>(null);
  const lotSearchRef = useRef<HTMLInputElement>(null);
  const serviceSearchRef = useRef<HTMLInputElement>(null);

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

  // Filter services based on search term
  const filteredServices = lotServices
    ?.filter(
      (service) =>
        service.name?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        service.code?.toLowerCase().includes(serviceSearch.toLowerCase())
    )
    .slice(0, 50);

  // Get selected items
  const selectedVendor = vendors?.find(
    (v) => v.code === contractFormData.vendor_code
  );
  const selectedFacilityDropdown = facilities?.find(
    (f) => f.code === contractFormData.facility_code
  );
  const selectedLot = lots?.find(
    (l) => l.number === contractFormData.lot_number
  );

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
    setServiceSearch("");
    setIsVendorDropdownOpen(false);
    setIsFacilityDropdownOpen(false);
    setIsLotDropdownOpen(false);
    setIsServiceDropdownOpen(false);
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
        services: [], // Start with empty array for adding new services
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
    setContractFormData((prev) => ({ ...prev, vendor_code: vendor.code }));
    setIsVendorDropdownOpen(false);
    setVendorSearch("");
  };

  const handleFacilitySelectDropdown = (facility: any) => {
    setContractFormData((prev) => ({ ...prev, facility_code: facility.code }));
    setIsFacilityDropdownOpen(false);
    setFacilitySearch("");
  };

  const handleLotSelect = (lot: any) => {
    setContractFormData((prev) => ({ ...prev, lot_number: lot.number }));
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

  const toggleServiceDropdown = () => {
    setIsServiceDropdownOpen(!isServiceDropdownOpen);
    if (!isServiceDropdownOpen && serviceSearchRef.current) {
      setTimeout(() => serviceSearchRef.current?.focus(), 100);
    }
  };

  const handleServiceToggle = (serviceCode: string) => {
    setServicesFormData((prev) => {
      const isSelected = prev.services.includes(serviceCode);
      const newServices = isSelected
        ? prev.services.filter((code) => code !== serviceCode)
        : [...prev.services, serviceCode];

      return {
        ...prev,
        services: newServices,
      };
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setIsVendorDropdownOpen(false);
        setIsFacilityDropdownOpen(false);
        setIsLotDropdownOpen(false);
        setIsServiceDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                {vendorCode && (
                  <button
                    onClick={() => router.back()}
                    className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FaArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </button>
                )}
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    {vendorCode
                      ? `Vendor ${vendorCode} Contracts`
                      : "Contract Management"}
                  </h1>
                  <p className="text-sm md:text-base text-purple-100">
                    Manage vendor facility contracts and services
                  </p>
                </div>
              </div>
              <button
                onClick={() => openModal("create")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
              >
                <FaPlus /> Add Contract
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 md:p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                />
              </div>

              {!vendorCode && (
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVendorDropdownOpen(!isVendorDropdownOpen);
                      setIsFacilityDropdownOpen(false);
                      setIsLotDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between"
                  >
                    <span
                      className={
                        filters.vendor_code ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {vendors?.find((v) => v.code === filters.vendor_code)
                        ?.name || "All Vendors"}
                    </span>
                    <FaChevronDown
                      className={`text-gray-400 transition-transform ${
                        isVendorDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isVendorDropdownOpen && (
                    <div className="absolute z-[60] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
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
                        <div
                          className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                          onClick={() => {
                            handleFilterChange("vendor_code", "");
                            setIsVendorDropdownOpen(false);
                            setVendorSearch("");
                          }}
                        >
                          <div className="font-semibold text-gray-900">
                            All Vendors
                          </div>
                        </div>
                        {filteredVendors && filteredVendors.length > 0 ? (
                          filteredVendors.map((vendor) => (
                            <div
                              key={vendor.id}
                              className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                              onClick={() => {
                                handleFilterChange("vendor_code", vendor.code);
                                setIsVendorDropdownOpen(false);
                                setVendorSearch("");
                              }}
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
              )}

              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setIsFacilityDropdownOpen(!isFacilityDropdownOpen);
                    setIsVendorDropdownOpen(false);
                    setIsLotDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      filters.facility_code ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {facilities?.find((f) => f.code === filters.facility_code)
                      ?.name || "All Facilities"}
                  </span>
                  <FaChevronDown
                    className={`text-gray-400 transition-transform ${
                      isFacilityDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isFacilityDropdownOpen && (
                  <div className="absolute z-[60] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
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
                      <div
                        className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                        onClick={() => {
                          handleFilterChange("facility_code", "");
                          setIsFacilityDropdownOpen(false);
                          setFacilitySearch("");
                        }}
                      >
                        <div className="font-semibold text-gray-900">
                          All Facilities
                        </div>
                      </div>
                      {filteredFacilitiesDropdown &&
                      filteredFacilitiesDropdown.length > 0 ? (
                        filteredFacilitiesDropdown.map((facility) => (
                          <div
                            key={facility.id}
                            className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                            onClick={() => {
                              handleFilterChange(
                                "facility_code",
                                facility.code
                              );
                              setIsFacilityDropdownOpen(false);
                              setFacilitySearch("");
                            }}
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

              <div className="relative dropdown-container">
                <button
                  type="button"
                  onClick={() => {
                    setIsLotDropdownOpen(!isLotDropdownOpen);
                    setIsVendorDropdownOpen(false);
                    setIsFacilityDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between"
                >
                  <span
                    className={
                      filters.lot_number ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {lots?.find((l) => l.number === filters.lot_number)?.name ||
                      "All Lots"}
                  </span>
                  <FaChevronDown
                    className={`text-gray-400 transition-transform ${
                      isLotDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isLotDropdownOpen && (
                  <div className="absolute z-[60] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                    <div className="p-3 md:p-4 border-b border-gray-100">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search lots..."
                          value={lotSearch}
                          onChange={(e) => setLotSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm md:text-base"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div
                        className="px-3 md:px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                        onClick={() => {
                          handleFilterChange("lot_number", "");
                          setIsLotDropdownOpen(false);
                          setLotSearch("");
                        }}
                      >
                        <div className="font-semibold text-gray-900 text-sm md:text-base">
                          All Lots
                        </div>
                      </div>
                      {filteredLots && filteredLots.length > 0 ? (
                        filteredLots.map((lot) => (
                          <div
                            key={lot.id}
                            className="px-3 md:px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                            onClick={() => {
                              handleFilterChange("lot_number", lot.number);
                              setIsLotDropdownOpen(false);
                              setLotSearch("");
                            }}
                          >
                            <div className="font-semibold text-gray-900 text-sm md:text-base">
                              {lot.name}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">
                              Lot Number: {lot.number}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 md:px-4 py-6 md:py-8 text-center text-gray-500 text-sm md:text-base">
                          No lots found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
                            className="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Actions"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>

                          {activeDropdown === contract.id && (
                            <>
                              {/* Backdrop to close dropdown */}
                              <div
                                className="fixed inset-0 z-30"
                                onClick={() => setActiveDropdown(null)}
                              ></div>

                              {/* Dropdown menu */}
                              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-40 overflow-hidden">
                                <div className="py-2">
                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      router.push(`/contracts/${contract.id}`);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3"
                                  >
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <FaEye className="text-blue-500" />
                                    </div>
                                    <span className="font-medium">
                                      View Details
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      openModal("services", contract);
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-3"
                                  >
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <FaStethoscope className="text-green-500" />
                                    </div>
                                    <span className="font-medium">
                                      Manage Services
                                    </span>
                                  </button>

                                  <div className="border-t border-gray-100 my-2"></div>

                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      router.push(
                                        `/vendors/${contract.vendor_code}`
                                      );
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-3"
                                  >
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-purple-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <span className="font-medium">
                                      View Vendor
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      router.push(
                                        `/facilities/${contract.facility_code}`
                                      );
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center gap-3"
                                  >
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-indigo-500"
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
                                    <span className="font-medium">
                                      View Facility
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      router.push(
                                        `/lots/${contract.lot_number}`
                                      );
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors flex items-center gap-3"
                                  >
                                    <div className="w-5 h-5 flex items-center justify-center">
                                      <svg
                                        className="w-4 h-4 text-orange-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <span className="font-medium">
                                      View Lot
                                    </span>
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
          {filteredContracts?.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No contracts match your search criteria"
                : "No contracts found. Create your first contract!"}
            </div>
          ) : (
            filteredContracts?.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {contract.vendor_name}
                    </h3>
                    <div className="text-sm text-gray-500 font-mono mb-2">
                      {contract.vendor_code}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        contract.is_active === "1"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {contract.is_active === "1" ? <FaCheck /> : <FaTimes />}
                      {contract.is_active === "1" ? "Active" : "Inactive"}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === contract.id ? null : contract.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {activeDropdown === contract.id && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setActiveDropdown(null)}
                          ></div>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
                            <div className="p-1">
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  router.push(`/contracts/${contract.id}`);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                              >
                                <FaEye className="text-blue-500" /> View Details
                              </button>
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  openModal("services", contract);
                                }}
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
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Facility:</span>
                    <p className="text-gray-900">{contract.facility_name}</p>
                    <p className="text-gray-500 font-mono text-xs">
                      {contract.facility_code}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500 font-medium">Lot:</span>
                      <p className="text-gray-900">LOT {contract.lot_number}</p>
                      <p className="text-gray-500 text-xs">
                        {contract.lot_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">
                        Services:
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {contract.services.length} total
                        </span>
                        <span className="text-xs text-gray-500">
                          (
                          {
                            contract.services.filter((s) => s.is_active === "1")
                              .length
                          }{" "}
                          active)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredContracts && filteredContracts.length > 0 && (
          <div className="mt-4 md:mt-6 bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 md:hidden">
              Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center p-3 md:p-0">
                <div className="text-xl md:text-2xl font-bold text-purple-600">
                  {filteredContracts.length}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Total Contracts
                </div>
              </div>
              <div className="text-center p-3 md:p-0">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {filteredContracts.filter((c) => c.is_active === "1").length}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Active Contracts
                </div>
              </div>
              <div className="text-center p-3 md:p-0">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {filteredContracts.reduce(
                    (sum, c) => sum + c.services.length,
                    0
                  )}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  Total Services
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/View */}
      {showModal && modalType !== "services" && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-3 md:p-4 transition-all duration-300">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-4 md:px-6 py-3 md:py-4">
              <h2 className="text-lg md:text-xl font-bold text-white">
                {modalType === "create"
                  ? "Add New Contract"
                  : "Contract Details"}
              </h2>
            </div>

            <form
              onSubmit={handleContractSubmit}
              className="p-4 md:p-6 space-y-4 md:space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor
                  </label>
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={toggleVendorDropdown}
                      disabled={!!vendorCode || vendorsLoading}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
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
                              className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm md:text-base"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredVendors && filteredVendors.length > 0 ? (
                            filteredVendors.map((vendor) => (
                              <div
                                key={vendor.id}
                                className="px-3 md:px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                                onClick={() => handleVendorSelect(vendor)}
                              >
                                <div className="font-semibold text-gray-900 text-sm md:text-base">
                                  {vendor.name}
                                </div>
                                <div className="text-xs md:text-sm text-gray-500">
                                  Code: {vendor.code}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
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
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                    disabled={false}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
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
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    <span
                      className={
                        selectedFacilityDropdown
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {facilitiesLoading
                        ? "Loading facilities..."
                        : selectedFacilityDropdown
                        ? `${selectedFacilityDropdown.name} (${selectedFacilityDropdown.code})`
                        : "Select a facility"}
                    </span>
                    <FaChevronDown
                      className={`text-gray-400 transition-transform ${
                        isFacilityDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isFacilityDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                      <div className="p-3 md:p-4 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            ref={facilitySearchRef}
                            type="text"
                            placeholder="Search facilities..."
                            value={facilitySearch}
                            onChange={(e) => setFacilitySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm md:text-base"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredFacilitiesDropdown &&
                        filteredFacilitiesDropdown.length > 0 ? (
                          filteredFacilitiesDropdown.map((facility) => (
                            <div
                              key={facility.id}
                              className="px-3 md:px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                              onClick={() =>
                                handleFacilitySelectDropdown(facility)
                              }
                            >
                              <div className="font-semibold text-gray-900 text-sm md:text-base">
                                {facility.name}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500">
                                Code: {facility.code}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
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
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    <span
                      className={
                        selectedLot ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {lotsLoading
                        ? "Loading lots..."
                        : selectedLot
                        ? `${selectedLot.name} (Lot ${selectedLot.number})`
                        : "Select a lot"}
                    </span>
                    <FaChevronDown
                      className={`text-gray-400 transition-transform ${
                        isLotDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isLotDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                      <div className="p-3 md:p-4 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            ref={lotSearchRef}
                            type="text"
                            placeholder="Search lots..."
                            value={lotSearch}
                            onChange={(e) => setLotSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm md:text-base"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredLots && filteredLots.length > 0 ? (
                          filteredLots.map((lot) => (
                            <div
                              key={lot.id}
                              className="px-3 md:px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
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
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Add Services to Contract
              </h2>
              <p className="text-green-100 text-sm">
                {selectedContract.vendor_name} -{" "}
                {selectedContract.facility_name} (Lot{" "}
                {selectedContract.lot_number})
              </p>
            </div>

            <form onSubmit={handleServicesSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract ID
                </label>
                <input
                  type="text"
                  value={selectedContract.id}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <div className="text-sm text-gray-500 mt-1">
                  This is the contract ID that services will be added to
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Services ({selectedContract.services.length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {selectedContract.services.length > 0 ? (
                    selectedContract.services.map((service) => (
                      <div
                        key={service.service_id}
                        className="flex items-center justify-between bg-white p-2 rounded shadow-sm"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
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
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No services currently assigned to this contract
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Services to Add
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={toggleServiceDropdown}
                    disabled={lotServicesLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-left bg-white flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span
                      className={
                        servicesFormData.services.length > 0
                          ? "text-gray-900"
                          : "text-gray-500"
                      }
                    >
                      {lotServicesLoading
                        ? "Loading available services..."
                        : servicesFormData.services.length > 0
                        ? `${servicesFormData.services.length} service(s) selected`
                        : "Select services to add"}
                    </span>
                    <FaChevronDown
                      className={`text-gray-400 transition-transform ${
                        isServiceDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isServiceDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            ref={serviceSearchRef}
                            type="text"
                            placeholder="Search services..."
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredServices && filteredServices.length > 0 ? (
                          filteredServices.map((service) => {
                            const isSelected =
                              servicesFormData.services.includes(service.code);
                            const isCurrentlyInContract =
                              selectedContract.services.some(
                                (s) => s.service_code === service.code
                              );

                            return (
                              <div
                                key={service.id}
                                className={`px-4 py-3 cursor-pointer transition-colors ${
                                  isCurrentlyInContract
                                    ? "bg-gray-100 cursor-not-allowed opacity-50"
                                    : isSelected
                                    ? "bg-green-50 hover:bg-green-100"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() =>
                                  !isCurrentlyInContract &&
                                  handleServiceToggle(service.code)
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900">
                                      {service.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Code: {service.code}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isCurrentlyInContract && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Already Added
                                      </span>
                                    )}
                                    {isSelected && !isCurrentlyInContract && (
                                      <FaCheck className="text-green-600" />
                                    )}
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${
                                        service.is_active === "1"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {service.is_active === "1"
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            {lotServicesLoading
                              ? "Loading services..."
                              : "No services found for this lot"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Services are loaded based on the contract&apos;s lot number (
                  {selectedContract.lot_number})
                </div>
              </div>

              {servicesFormData.services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Services ({servicesFormData.services.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {servicesFormData.services.map((serviceCode) => {
                      const service = filteredServices?.find(
                        (s) => s.code === serviceCode
                      );
                      return (
                        <span
                          key={serviceCode}
                          className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          {service?.name || serviceCode}
                          <button
                            type="button"
                            onClick={() => handleServiceToggle(serviceCode)}
                            className="ml-1 hover:text-green-600"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

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
                  disabled={
                    isUpdating || servicesFormData.services.length === 0
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {isUpdating
                    ? "Adding Services..."
                    : `Add ${servicesFormData.services.length} Service(s)`}
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
