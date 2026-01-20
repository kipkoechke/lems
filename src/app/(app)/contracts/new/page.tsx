"use client";
import BackButton from "@/components/common/BackButton";
import { PermissionGate } from "@/components/PermissionGate";
import { Permission } from "@/lib/rbac";
import { useCreateContract } from "@/features/vendors/useCreateContract";
import { useFacilities } from "@/features/facilities/useFacilities";
import { useVendors } from "@/features/vendors/useVendors";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import {
  FaFileContract,
  FaSave,
  FaTimes,
  FaSearch,
  FaChevronDown,
  FaSpinner,
} from "react-icons/fa";
import { Facility } from "@/services/apiFacility";

const contractSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  facility_id: z.string().min(1, "Facility is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

export default function NewContractPage() {
  const router = useRouter();
  const { createContract, isCreating } = useCreateContract();

  const [vendorSearch, setVendorSearch] = useState("");
  const [facilitySearch, setFacilitySearch] = useState("");
  const [facilitySearchQuery, setFacilitySearchQuery] = useState("");
  const [selectedFacilityObj, setSelectedFacilityObj] =
    useState<Facility | null>(null);
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  const facilitySearchRef = useRef<HTMLInputElement>(null);

  // Load data
  const { vendors, isLoading: vendorsLoading } = useVendors();
  const { facilities, isLoading: facilitiesLoading } = useFacilities(
    facilitySearchQuery ? { search: facilitySearchQuery } : undefined,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      status: "active",
    },
  });

  const selectedVendorId = watch("vendor_id");
  const selectedFacilityId = watch("facility_id");

  // Get selected items for display
  const selectedVendor = vendors?.find((v) => v.id === selectedVendorId);
  const selectedFacility =
    selectedFacilityObj || facilities?.find((f) => f.id === selectedFacilityId);

  // Filter data based on search terms
  const filteredVendors = vendors
    ?.filter(
      (vendor) =>
        vendor.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
        vendor.code?.toLowerCase().includes(vendorSearch.toLowerCase()),
    )
    .slice(0, 50);

  const filteredFacilities = facilities?.slice(0, 50);

  // Handle facility search with API request
  const handleFacilitySearch = () => {
    if (facilitySearch.trim()) {
      setFacilitySearchQuery(facilitySearch.trim());
    } else {
      setFacilitySearchQuery("");
    }
  };

  // Handle facility selection
  const handleFacilitySelect = (facility: Facility) => {
    setValue("facility_id", facility.id);
    setSelectedFacilityObj(facility);
    setIsFacilityDropdownOpen(false);
    setTimeout(() => {
      setFacilitySearch("");
      setFacilitySearchQuery("");
    }, 100);
  };

  // Clear facility selection
  const clearFacilitySelection = () => {
    setValue("facility_id", "");
    setSelectedFacilityObj(null);
    setFacilitySearch("");
    setFacilitySearchQuery("");
  };

  // Focus facility search input when dropdown opens
  useEffect(() => {
    if (isFacilityDropdownOpen && facilitySearchRef.current) {
      facilitySearchRef.current.focus();
    }
  }, [isFacilityDropdownOpen]);

  const onSubmit = (data: ContractFormData) => {
    createContract(data, {
      onSuccess: (newContract) => {
        router.push(`/contracts/${newContract.id}`);
      },
    });
  };

  return (
    <PermissionGate permission={Permission.CREATE_CONTRACTS}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
              <div className="flex items-center gap-3 md:gap-4">
                <BackButton onClick={() => router.back()} />
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaFileContract className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                    Create New Contract
                  </h1>
                  <p className="text-sm md:text-base text-purple-100">
                    Add a new vendor facility contract
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contract Information */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaFileContract className="w-4 h-4 text-purple-600" />
                  </div>
                  Contract Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Vendor Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsVendorDropdownOpen(!isVendorDropdownOpen);
                          setIsFacilityDropdownOpen(false);
                        }}
                        disabled={vendorsLoading}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between ${
                          errors.vendor_id
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
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
                          <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="Search vendors..."
                                value={vendorSearch}
                                onChange={(e) =>
                                  setVendorSearch(e.target.value)
                                }
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
                                  onClick={() => {
                                    setValue("vendor_id", vendor.id);
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
                    {errors.vendor_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.vendor_id.message}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      {...register("status")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.status.message}
                      </p>
                    )}
                  </div>

                  {/* Facility Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facility *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsFacilityDropdownOpen(!isFacilityDropdownOpen);
                          setIsVendorDropdownOpen(false);
                        }}
                        disabled={facilitiesLoading}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-left bg-white flex items-center justify-between ${
                          errors.facility_id
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        <span
                          className={
                            selectedFacility ? "text-gray-900" : "text-gray-500"
                          }
                        >
                          {facilitiesLoading
                            ? "Loading facilities..."
                            : selectedFacility
                              ? `${selectedFacility.name} (${selectedFacility.code})`
                              : "Select a facility"}
                        </span>
                        <div className="flex items-center gap-2">
                          {selectedFacility && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearFacilitySelection();
                              }}
                              className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          )}
                          <FaChevronDown
                            className={`text-gray-400 transition-transform ${
                              isFacilityDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
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
                                onChange={(e) =>
                                  setFacilitySearch(e.target.value)
                                }
                                className="w-full pl-10 pr-20 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleFacilitySearch();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleFacilitySearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs font-medium"
                              >
                                Search
                              </button>
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {facilitiesLoading ? (
                              <div className="px-4 py-8 text-center text-gray-500">
                                <FaSpinner className="w-6 h-6 mx-auto mb-2 text-purple-500 animate-spin" />
                                <div className="text-sm">
                                  Loading facilities...
                                </div>
                              </div>
                            ) : filteredFacilities &&
                              filteredFacilities.length > 0 ? (
                              filteredFacilities.map((facility) => (
                                <div
                                  key={facility.id}
                                  className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors"
                                  onClick={() => handleFacilitySelect(facility)}
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
                                {facilitySearchQuery
                                  ? "No facilities found for your search"
                                  : "Type and search for a facility"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.facility_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.facility_id.message}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      {...register("start_date")}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.start_date ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.start_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.start_date.message}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      {...register("end_date")}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.end_date ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.end_date.message}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      placeholder="Add any notes about this contract..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 sm:flex-initial bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Contract...
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      Create Contract
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/contracts")}
                  className="flex-1 sm:flex-initial border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}
