"use client";

import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateEquipment } from "@/features/equipments/useCreateEquipment";
import { useVendors } from "@/features/vendors/useVendors";
import { EquipmentCreateRequest } from "@/services/apiEquipment";
import { FaCogs, FaChevronDown, FaSearch, FaArrowLeft } from "react-icons/fa";
import BackButton from "@/components/BackButton";

const NewEquipment: React.FC = () => {
  const router = useRouter();
  const { createEquipment, isCreating } = useCreateEquipment();
  const { vendors = [], isLoading: vendorsLoading } = useVendors();

  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const vendorSearchRef = useRef<HTMLInputElement>(null);

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

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    createEquipment(form, {
      onSuccess: () => {
        router.push("/equipments");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-8 py-4 md:py-6 rounded-t-xl md:rounded-t-2xl">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => router.push("/equipments")}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FaCogs className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                  Add New Equipment
                </h1>
                <p className="text-sm md:text-base text-blue-100">
                  Create new equipment record
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
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
                  value={form.serial_number || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      serial_number: e.target.value || null,
                    })
                  }
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  placeholder="Serial number (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  value={form.model ?? ""}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
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
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
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
                        setTimeout(() => vendorSearchRef.current?.focus(), 100);
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

              {/* Description */}
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
              <BackButton 
                onClick={() => router.push("/equipments")}
                className="w-full md:flex-1" 
              />
              <button
                type="submit"
                disabled={isCreating}
                className="w-full md:flex-1 px-4 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 text-sm md:text-base"
              >
                {isCreating ? "Creating..." : "Create Equipment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewEquipment;