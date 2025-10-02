"use client";

import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEquipment } from "@/features/equipments/useCreateEquipment";
import { useVendors } from "@/features/vendors/useVendors";
import { EquipmentCreateRequest } from "@/services/apiEquipment";
import { equipmentSchema, EquipmentFormData } from "@/lib/validations";
import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
import { FaCogs, FaChevronDown, FaSearch, FaArrowLeft } from "react-icons/fa";
import BackButton from "@/components/common/BackButton";

const NewEquipment: React.FC = () => {
  const router = useRouter();
  const { createEquipment, isCreating } = useCreateEquipment();
  const { vendors = [], isLoading: vendorsLoading } = useVendors();

  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const vendorSearchRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    mode: "onBlur",
    defaultValues: {
      status: "active",
    },
  });

  const watchedVendorCode = watch("vendor_code");

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
    () => vendors?.find((v) => v.code === watchedVendorCode),
    [vendors, watchedVendorCode]
  );

  const onSubmit = (data: EquipmentFormData) => {
    // Transform data to match API expectations
    const equipmentData: EquipmentCreateRequest = {
      name: data.name,
      model: data.model || "",
      serial_number: data.serial_number || "",
      vendor_id: selectedVendor?.id || "",
      status: data.status === "active" ? "available" : "unavailable",
      description: data.description || "",
      manufacturer: data.manufacturer || "",
      year: data.year || "",
    };

    createEquipment(equipmentData, {
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
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 md:p-8 space-y-4 md:space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Equipment Name"
                type="text"
                placeholder="Enter equipment name"
                register={register("name")}
                error={errors.name?.message}
                required
                disabled={isCreating}
              />

              <InputField
                label="Serial Number"
                type="text"
                placeholder="Enter serial number (optional)"
                register={register("serial_number")}
                error={errors.serial_number?.message}
                disabled={isCreating}
              />

              <InputField
                label="Model"
                type="text"
                placeholder="Enter model"
                register={register("model")}
                error={errors.model?.message}
                disabled={isCreating}
              />
              <InputField
                label="Manufacturer"
                type="text"
                placeholder="Enter manufacturer"
                register={register("manufacturer")}
                error={errors.manufacturer?.message}
                disabled={isCreating}
              />

              <InputField
                label="Year"
                type="number"
                placeholder="Enter year"
                register={register("year")}
                error={errors.year?.message}
                disabled={isCreating}
              />
              <SelectField
                label="Status"
                register={register("status")}
                error={errors.status?.message}
                required
                disabled={isCreating}
                placeholder="Select status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "maintenance", label: "Maintenance" },
                ]}
              />

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
                                setValue("vendor_code", v.code);
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
                  {...register("description")}
                  disabled={isCreating}
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
