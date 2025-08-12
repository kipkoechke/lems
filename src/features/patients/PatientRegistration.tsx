"use client";

import Modal from "@/components/Modal";
import { useFacilities } from "@/features/facilities/useFacilities";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FaArrowRight,
  FaChevronDown,
  FaHospital,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { usePatients } from "./usePatients";
import { useRegisterPatient } from "./useRegisterPatient";

interface PatientRegistrationProps {
  onStepOneComplete?: (
    patient: Patient,
    paymentModeId: string,
    facility: Facility
  ) => void;
  onCloseModal?: () => void;
}

// Enhanced payment modes with better UI
const PAYMENT_MODES = [
  {
    paymentModeId: "sha",
    paymentModeName: "SHA",
    description: "Social Health Authority",
    icon: "🏥",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-800",
  },
  {
    paymentModeId: "cash",
    paymentModeName: "CASH",
    description: "Direct cash payment",
    icon: "💵",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-800",
  },
  {
    paymentModeId: "other_insurances",
    paymentModeName: "OTHER INSURANCES",
    description: "Third-party insurance coverage",
    icon: "🛡️",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-800",
  },
];

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  onStepOneComplete,
  onCloseModal,
}) => {
  const { patients } = usePatients();

  const [selectedid, setSelectedid] = useState<string>("");
  const [selectedPaymentModeId, setSelectedPaymentModeId] =
    useState<string>("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );

  // Ref to track newly registered patient ID
  const newlyRegisteredPatientId = useRef<string | null>(null);

  // Facility dropdown state
  const [facilitySearch, setFacilitySearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>(""); // Actual search query for API
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] =
    useState<boolean>(false);
  const facilityDropdownRef = useRef<HTMLDivElement>(null);
  const facilitySearchRef = useRef<HTMLInputElement>(null);

  // Patient dropdown state
  const [patientSearch, setPatientSearch] = useState<string>("");
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] =
    useState<boolean>(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);
  const patientSearchRef = useRef<HTMLInputElement>(null);

  // Get facilities with search parameters - simplified without debounce
  const { facilities, isLoading: isFacilitiesLoading } = useFacilities(
    searchQuery ? { search: searchQuery } : undefined
  );

  // Handle facility search with API request - simplified
  const handleFacilitySearch = () => {
    if (facilitySearch.trim()) {
      setSearchQuery(facilitySearch.trim());
    } else {
      // If search is empty, clear search query to show all facilities
      setSearchQuery("");
    }
  };

  // Use the searched facilities or show first 50 if no search
  const filteredFacilities = facilities?.slice(0, 50);

  // Filter patients based on search
  const filteredPatients = patients
    ?.filter(
      (patient) =>
        patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
        patient.phone.includes(patientSearch) ||
        patient.sha_number?.includes(patientSearch)
    )
    .slice(0, 50);

  const selectedPatient = patients?.find((p) => p.id === selectedid);

  // Check if all fields are completed
  const isComplete = selectedFacilityId && selectedid && selectedPaymentModeId;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        facilityDropdownRef.current &&
        !facilityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFacilityDropdownOpen(false);
      }
      if (
        patientDropdownRef.current &&
        !patientDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPatientDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isFacilityDropdownOpen && facilitySearchRef.current) {
      facilitySearchRef.current.focus();
    }
  }, [isFacilityDropdownOpen]);

  // Focus patient search input when dropdown opens
  useEffect(() => {
    if (isPatientDropdownOpen && patientSearchRef.current) {
      patientSearchRef.current.focus();
    }
  }, [isPatientDropdownOpen]);

  // Load initial facilities when dropdown opens for the first time
  useEffect(() => {
    if (
      isFacilityDropdownOpen &&
      !searchQuery &&
      (!facilities || facilities.length === 0)
    ) {
      // Trigger initial load of facilities if none are loaded
      setSearchQuery(""); // This will trigger the API call with no search param
    }
  }, [isFacilityDropdownOpen, searchQuery, facilities]);

  // Auto-select newly registered patient when patients list updates
  useEffect(() => {
    if (newlyRegisteredPatientId.current && patients) {
      const patientExists = patients.find(
        (p) => p.id === newlyRegisteredPatientId.current
      );
      if (patientExists) {
        setSelectedid(newlyRegisteredPatientId.current);
        newlyRegisteredPatientId.current = null; // Clear the ref
      }
    }
  }, [patients]);

  const handleFacilitySelect = (facility: Facility) => {
    console.log("Selecting facility:", facility);
    setSelectedFacilityId(facility.id);
    setSelectedFacility(facility); // Store the full facility object
    setIsFacilityDropdownOpen(false);
    // Don't clear the search immediately to allow user to see what they selected
    // Clear it after a short delay
    setTimeout(() => {
      setFacilitySearch("");
      setSearchQuery("");
    }, 100);
  };

  const clearFacilitySelection = () => {
    setSelectedFacilityId("");
    setSelectedFacility(null);
    setFacilitySearch("");
    setSearchQuery("");
  };

  const togglePatientDropdown = () => {
    setIsPatientDropdownOpen(!isPatientDropdownOpen);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedid(patient.id);
    setIsPatientDropdownOpen(false);
    setPatientSearch("");
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients?.find((p) => p.id === selectedid);

    if (
      !patient ||
      !selectedPaymentModeId ||
      !selectedFacilityId ||
      !selectedFacility
    )
      return;

    onStepOneComplete?.(patient, selectedPaymentModeId, selectedFacility);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            <FaUser className="w-3 h-3 md:w-4 md:h-4" />
            Registration
          </div>
          <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
            Patient Registration
          </h1>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto px-2 md:px-4">
            Complete your registration to access our healthcare services
          </p>
        </div>

        <form onSubmit={handleProceed} className="space-y-3 md:space-y-8">
          {/* Facility and Patient - Same Row on Desktop, Stacked on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-8">
            {/* Medical Facility */}
            <div className="bg-white rounded-lg md:rounded-2xl shadow-sm md:shadow-lg p-3 md:p-8 hover:shadow-md md:hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="p-2 md:p-3 bg-blue-100 rounded-lg md:rounded-xl">
                  <FaHospital className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-xl font-bold text-gray-900">
                    Medical Facility
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    Select your healthcare provider
                  </p>
                </div>
              </div>

              <div className="relative" ref={facilityDropdownRef}>
                <div
                  className="w-full p-3 md:p-4 bg-gray-50 rounded-xl cursor-pointer flex items-center justify-between hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"
                  onClick={() =>
                    setIsFacilityDropdownOpen(!isFacilityDropdownOpen)
                  }
                >
                  <span
                    className={`text-sm md:text-base ${
                      selectedFacility
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {selectedFacility
                      ? selectedFacility.name
                      : "Choose medical facility"}
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
                        <FaTimes className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    )}
                    <FaChevronDown
                      className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200 ${
                        isFacilityDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {isFacilityDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                    <div className="p-3 md:p-4 border-b border-gray-100">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                        <input
                          ref={facilitySearchRef}
                          type="text"
                          placeholder="Search facilities..."
                          value={facilitySearch}
                          onChange={(e) => setFacilitySearch(e.target.value)}
                          className="w-full pl-8 md:pl-10 pr-16 md:pr-20 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm md:text-base"
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
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 md:px-3 py-1 md:py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {isFacilitiesLoading ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <FaSpinner className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 text-blue-500 animate-spin" />
                          <div className="text-sm md:text-base">
                            Loading facilities...
                          </div>
                        </div>
                      ) : filteredFacilities &&
                        filteredFacilities.length > 0 ? (
                        filteredFacilities.map((facility) => (
                          <div
                            key={facility.id}
                            className="px-3 md:px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                            onClick={() => handleFacilitySelect(facility)}
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
                        <div className="px-4 py-8 text-center text-gray-500">
                          <FaHospital className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-300" />
                          <div className="text-sm md:text-base">
                            No facilities found
                          </div>
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery("");
                                setFacilitySearch("");
                              }}
                              className="mt-2 text-blue-600 hover:text-blue-800 text-xs md:text-sm underline"
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Details */}
            <div className="bg-white rounded-lg md:rounded-2xl shadow-sm md:shadow-lg p-3 md:p-8 hover:shadow-md md:hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 md:p-3 bg-green-100 rounded-lg md:rounded-xl">
                    <FaUser className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-xl font-bold text-gray-900">
                      Patient
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500">
                      Select or add patient
                    </p>
                  </div>
                </div>

                <Modal>
                  <Modal.Open opens="patient-form">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-2 md:px-4 py-2 bg-green-600 text-white rounded-lg md:rounded-xl hover:bg-green-700 transition-colors shadow-sm md:shadow-lg hover:shadow-md md:hover:shadow-xl text-xs md:text-sm"
                    >
                      <FaUserPlus className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Add New</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </Modal.Open>
                  <Modal.Window name="patient-form">
                    <PatientRegistrationForm
                      newlyRegisteredPatientId={newlyRegisteredPatientId}
                    />
                  </Modal.Window>
                </Modal>
              </div>

              <div
                className="relative dropdown-container"
                ref={patientDropdownRef}
              >
                <button
                  type="button"
                  onClick={togglePatientDropdown}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-left bg-white flex items-center justify-between text-sm md:text-base"
                >
                  <span
                    className={
                      selectedPatient ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {selectedPatient
                      ? `${selectedPatient.name} (${selectedPatient.phone})`
                      : "Choose a patient"}
                  </span>
                  <FaChevronDown
                    className={`text-gray-400 transition-transform ${
                      isPatientDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isPatientDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-80 overflow-hidden">
                    <div className="p-3 md:p-4 border-b border-gray-100">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          ref={patientSearchRef}
                          type="text"
                          placeholder="Search patients..."
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm md:text-base"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredPatients && filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className="px-3 md:px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <div className="font-semibold text-gray-900 text-sm md:text-base">
                              {patient.name}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">
                              Phone: {patient.phone}
                            </div>
                            {patient.sha_number && (
                              <div className="text-xs md:text-sm text-gray-500">
                                SHA: {patient.sha_number}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm md:text-base">
                          No patients found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg md:rounded-2xl shadow-sm md:shadow-lg p-3 md:p-8 hover:shadow-md md:hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 md:mb-8">
              <div className="p-2 md:p-3 bg-purple-100 rounded-lg md:rounded-xl">
                <span className="text-lg md:text-2xl">💳</span>
              </div>
              <div>
                <h3 className="text-base md:text-xl font-bold text-gray-900">
                  Payment Method
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  Select your payment option
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
              {PAYMENT_MODES.map((paymentMode) => (
                <label
                  key={paymentMode.paymentModeId}
                  className={`relative p-3 md:p-6 rounded-lg md:rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-sm md:hover:shadow-lg ${
                    selectedPaymentModeId === paymentMode.paymentModeId
                      ? "bg-blue-50 ring-2 ring-blue-500 shadow-sm md:shadow-lg"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMode"
                    value={paymentMode.paymentModeId}
                    checked={
                      selectedPaymentModeId === paymentMode.paymentModeId
                    }
                    onChange={(e) => setSelectedPaymentModeId(e.target.value)}
                    className="sr-only"
                  />

                  <div className="text-center">
                    <div className="text-2xl md:text-4xl mb-3 md:mb-4">
                      {paymentMode.icon}
                    </div>
                    <div className="font-bold text-gray-900 mb-2 text-sm md:text-lg">
                      {paymentMode.paymentModeName}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      {paymentMode.description}
                    </div>
                  </div>

                  {selectedPaymentModeId === paymentMode.paymentModeId && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-2 md:pt-4">
            <button
              type="submit"
              disabled={!isComplete}
              className={`inline-flex items-center gap-2 md:gap-3 px-6 md:px-12 py-3 md:py-4 rounded-lg md:rounded-2xl font-bold text-sm md:text-lg transition-all duration-300 shadow-sm md:shadow-lg hover:shadow-md md:hover:shadow-xl w-full sm:w-auto ${
                isComplete
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isComplete ? (
                <>
                  <span className="hidden sm:inline">Continue to Services</span>
                  <span className="sm:hidden">Continue</span>
                  <FaArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Complete All Fields</span>
                  <span className="sm:hidden">Complete Fields</span>
                  <span className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                    ⚠️
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Separate component for the patient registration form inside the modal
interface PatientRegistrationFormProps {
  newlyRegisteredPatientId: React.MutableRefObject<string | null>;
  onCloseModal?: () => void;
}

const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  newlyRegisteredPatientId,
  onCloseModal,
}) => {
  const { registerPatients, isRegistering } = useRegisterPatient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    name: string;
    phone: string;
    date_of_birth: string;
    sha_number?: string;
  }>();

  const handleAddPatient = (data: {
    name: string;
    phone: string;
    date_of_birth: string;
    sha_number?: string;
  }) => {
    registerPatients(data, {
      onSuccess: (newPatient: Patient) => {
        console.log("Patient registration successful:", newPatient);
        // Store the new patient ID in ref for auto-selection
        newlyRegisteredPatientId.current = newPatient.id;
        // Reset the form
        reset();
        // Show success message
        toast.success("Patient registered successfully!");
        // Close the modal
        onCloseModal?.();
      },
      onError: (error: any) => {
        console.error("Patient registration failed:", error);
        toast.error(error.message || "Failed to register patient");
      },
    });
  };

  return (
    <div className="p-3 md:p-6 max-w-md mx-auto">
      <div className="text-center mb-4 md:mb-6">
        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3">
          <FaUserPlus className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
        </div>
        <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">
          Register New Patient
        </h3>
      </div>

      <form
        onSubmit={handleSubmit(handleAddPatient)}
        className="space-y-3 md:space-y-4"
      >
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              {...register("name", {
                required: "Name is required",
              })}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all border border-gray-200 text-sm"
              placeholder="Enter patient's full name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              })}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all border border-gray-200 text-sm"
              placeholder="10-digit phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              {...register("date_of_birth", {
                required: "Date of birth is required",
              })}
              type="date"
              className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all border border-gray-200 text-sm"
            />
            {errors.date_of_birth && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.date_of_birth.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              SHA Number{" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              {...register("sha_number")}
              className="w-full px-3 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all border border-gray-200 text-sm"
              placeholder="Enter SHA number if available"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full sm:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg text-sm"
          >
            {isRegistering ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registering...
              </div>
            ) : (
              "Register Patient"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
