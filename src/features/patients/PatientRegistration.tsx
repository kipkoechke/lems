"use client";

import Modal from "@/components/common/Modal";
import { useAppSelector } from "@/hooks/hooks";
import { useFacilities } from "@/features/facilities/useFacilities";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import { useCounties } from "@/features/counties/useCounties";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { usePatients } from "./usePatients";
import { useRegisterPatient } from "./useRegisterPatient";
import { useEligibilityCheck } from "./useEligibilityCheck";

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
}) => {
  // Get existing workflow data to preserve state when navigating back
  const workflow = useAppSelector((store) => store.workflow);

  // Patient search with API
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>("");
  const { patients } = usePatients(
    patientSearchQuery ? { search: patientSearchQuery } : undefined
  );

  // Eligibility check
  const { checkSHAEligibility, isCheckingEligibility, eligibilityResult } =
    useEligibilityCheck();

  const [selectedid, setSelectedid] = useState<string>(
    workflow.patient?.id || ""
  );
  const [selectedPaymentModeId, setSelectedPaymentModeId] = useState<string>(
    workflow.selectedPaymentMode?.paymentModeId || ""
  );
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    workflow.selectedFacility?.id || ""
  );
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    workflow.selectedFacility || null
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

  // Filter state for facility selection
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedKephLevel, setSelectedKephLevel] = useState<string>("");
  const [isCountyDropdownOpen, setIsCountyDropdownOpen] =
    useState<boolean>(false);
  const [isKephDropdownOpen, setIsKephDropdownOpen] = useState<boolean>(false);
  const [countySearch, setCountySearch] = useState<string>("");
  const [kephSearch, setKephSearch] = useState<string>("");

  // Get counties data
  const { counties, isLoading: isCountiesLoading } = useCounties();

  // KEPH Levels
  const kephLevels = [
    { id: "Level 1", name: "Level 1" },
    { id: "Level 2", name: "Level 2" },
    { id: "Level 3", name: "Level 3" },
    { id: "Level 4", name: "Level 4" },
    { id: "Level 5", name: "Level 5" },
    { id: "Level 6", name: "Level 6" },
  ];

  // Get facilities with search and filter parameters
  const facilityParams = {
    ...(searchQuery && { search: searchQuery }),
    ...(selectedCounty && { county: selectedCounty }),
    ...(selectedKephLevel && { keph_level: selectedKephLevel }),
  };

  const { facilities, isLoading: isFacilitiesLoading } = useFacilities(
    Object.keys(facilityParams).length > 0 ? facilityParams : undefined
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
  const filteredPatients = patients?.slice(0, 50);

  const selectedPatient = patients?.find((p) => p.id === selectedid);

  // Handle patient search with API request
  const handlePatientSearch = () => {
    if (patientSearch.trim()) {
      setPatientSearchQuery(patientSearch.trim());
    } else {
      // If search is empty, clear search query to show all patients
      setPatientSearchQuery("");
    }
  };

  // Handle SHA eligibility check
  const handleEligibilityCheck = useCallback(() => {
    if (selectedPatient?.sha_number && selectedPaymentModeId === "sha") {
      checkSHAEligibility({
        identification_type: "National ID",
        identification_number: selectedPatient.sha_number,
      });
    } else if (selectedPaymentModeId === "sha") {
      toast.error(
        "Please select a patient with SHA number for eligibility check"
      );
    }
  }, [selectedPatient?.sha_number, selectedPaymentModeId, checkSHAEligibility]);

  // Auto-trigger eligibility check when SHA is selected and patient has SHA number
  useEffect(() => {
    if (selectedPaymentModeId === "sha" && selectedPatient?.sha_number) {
      handleEligibilityCheck();
    }
  }, [
    selectedPaymentModeId,
    selectedPatient?.sha_number,
    handleEligibilityCheck,
  ]);

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

  // Handle clicks outside filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle county dropdown
      if (
        isCountyDropdownOpen &&
        !(event.target as Element).closest(".county-dropdown")
      ) {
        setIsCountyDropdownOpen(false);
      }
      // Handle KEPH dropdown
      if (
        isKephDropdownOpen &&
        !(event.target as Element).closest(".keph-dropdown")
      ) {
        setIsKephDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCountyDropdownOpen, isKephDropdownOpen]);

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
    // Clear search query after a delay to show the selected patient
    setTimeout(() => {
      setPatientSearchQuery("");
    }, 100);
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 ">
      <div className="">
        <form onSubmit={handleProceed} className="space-y-2">
          {/* Main Layout: Facility on Left, Patient + Payment on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4">
            {/* LEFT SIDE: Medical Facility */}
            <div className="bg-white rounded-lg shadow-sm p-2 md:p-4 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <div className="p-1 md:p-2 bg-blue-100 rounded-lg">
                  <FaHospital className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm md:text-lg font-bold text-gray-900">
                    Medical Facility
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select your healthcare provider
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* County Filter */}
                <div className="relative county-dropdown">
                  <div
                    className="w-full p-1 md:p-2 bg-gray-50 rounded-lg cursor-pointer flex items-center justify-between hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"
                    onClick={() =>
                      setIsCountyDropdownOpen(!isCountyDropdownOpen)
                    }
                  >
                    <span
                      className={`text-xs truncate ${
                        selectedCounty
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedCounty
                        ? counties?.find((c) => c.code === selectedCounty)?.name
                        : "Select county"}
                    </span>
                    <FaChevronDown
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                        isCountyDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isCountyDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-40 overflow-hidden">
                      <div className="p-1 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Search counties..."
                          value={countySearch}
                          onChange={(e) => setCountySearch(e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-xs"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto">
                        {isCountiesLoading ? (
                          <div className="p-2 text-center">
                            <FaSpinner className="animate-spin mx-auto mb-1 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Loading counties...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div
                              className="px-2 py-1 hover:bg-gray-50 cursor-pointer text-xs text-gray-700"
                              onClick={() => {
                                setSelectedCounty("");
                                setIsCountyDropdownOpen(false);
                                setCountySearch("");
                              }}
                            >
                              All Counties
                            </div>
                            {counties
                              ?.filter((county) =>
                                county.name
                                  .toLowerCase()
                                  .includes(countySearch.toLowerCase())
                              )
                              .map((county) => (
                                <div
                                  key={county.code}
                                  className="px-2 py-1 hover:bg-gray-50 cursor-pointer text-xs text-gray-700"
                                  onClick={() => {
                                    setSelectedCounty(county.code);
                                    setIsCountyDropdownOpen(false);
                                    setCountySearch("");
                                  }}
                                >
                                  {county.name}
                                </div>
                              ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* KEPH Level Filter */}
                <div className="relative keph-dropdown">
                  <div
                    className="w-full p-1 md:p-2 bg-gray-50 rounded-lg cursor-pointer flex items-center justify-between hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"
                    onClick={() => setIsKephDropdownOpen(!isKephDropdownOpen)}
                  >
                    <span
                      className={`text-xs truncate ${
                        selectedKephLevel
                          ? "text-gray-900 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedKephLevel || "Select KEPH level"}
                    </span>
                    <FaChevronDown
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                        isKephDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isKephDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="Search levels..."
                          value={kephSearch}
                          onChange={(e) => setKephSearch(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-xs md:text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <div
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs md:text-sm text-gray-700"
                          onClick={() => {
                            setSelectedKephLevel("");
                            setIsKephDropdownOpen(false);
                            setKephSearch("");
                          }}
                        >
                          All Levels
                        </div>
                        {kephLevels
                          .filter((level) =>
                            level.name
                              .toLowerCase()
                              .includes(kephSearch.toLowerCase())
                          )
                          .map((level) => (
                            <div
                              key={level.id}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs md:text-sm text-gray-700"
                              onClick={() => {
                                setSelectedKephLevel(level.id);
                                setIsKephDropdownOpen(false);
                                setKephSearch("");
                              }}
                            >
                              {level.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative" ref={facilityDropdownRef}>
                <div
                  className="w-full p-2 bg-gray-50 rounded-lg cursor-pointer flex items-center justify-between hover:bg-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200"
                  onClick={() =>
                    setIsFacilityDropdownOpen(!isFacilityDropdownOpen)
                  }
                >
                  <span
                    className={`text-xs md:text-sm ${
                      selectedFacility
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {selectedFacility
                      ? selectedFacility.name
                      : "Choose medical facility"}
                  </span>
                  <div className="flex items-center gap-1">
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
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
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

            {/* RIGHT SIDE: Patient + Payment Method */}
            <div className="space-y-1 md:space-y-2">
              {/* Patient Details */}
              <div className="bg-white rounded-lg md:rounded-2xl shadow-sm md:shadow-lg p-2 md:p-4 hover:shadow-md md:hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 md:p-2 bg-green-100 rounded-lg">
                      <FaUser className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-bold text-gray-900">
                        Patient
                      </h3>
                      <p className="text-xs text-gray-500">
                        Select or add patient
                      </p>
                    </div>
                  </div>

                  <Modal>
                    <Modal.Open opens="patient-form">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                      >
                        <FaUserPlus className="w-3 h-3" />
                        Add
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
                    className="w-full px-2 py-1 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-left bg-white flex items-center justify-between text-xs md:text-sm"
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
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                          <input
                            ref={patientSearchRef}
                            type="text"
                            placeholder="Search patients..."
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            className="w-full pl-8 md:pl-10 pr-16 md:pr-20 py-2 md:py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm md:text-base"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handlePatientSearch();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handlePatientSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 md:px-3 py-1 md:py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
                          >
                            Search
                          </button>
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
                          <div className="px-4 py-8 text-center text-gray-500">
                            <FaUser className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-300" />
                            <div className="text-sm md:text-base">
                              No patients found
                            </div>
                            {patientSearchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPatientSearchQuery("");
                                  setPatientSearch("");
                                }}
                                className="mt-2 text-green-600 hover:text-green-800 text-xs md:text-sm underline"
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

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-2 md:p-4 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <div className="p-1 md:p-2 bg-purple-100 rounded-lg">
                    <span className="text-sm md:text-lg">💳</span>
                  </div>
                  <div>
                    <h3 className="text-sm md:text-lg font-bold text-gray-900">
                      Payment Method
                    </h3>
                    <p className="text-xs text-gray-500">
                      Select your payment option
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedPaymentModeId}
                    onChange={(e) => setSelectedPaymentModeId(e.target.value)}
                    className="w-full px-2 py-1 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-xs md:text-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Choose payment method
                    </option>
                    {PAYMENT_MODES.map((paymentMode) => (
                      <option
                        key={paymentMode.paymentModeId}
                        value={paymentMode.paymentModeId}
                      >
                        {paymentMode.paymentModeName} -{" "}
                        {paymentMode.description}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
                </div>

                {/* SHA Eligibility Status */}
                {selectedPaymentModeId === "sha" && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {isCheckingEligibility ? (
                          <FaSpinner className="w-4 h-4 animate-spin text-blue-600" />
                        ) : eligibilityResult?.eligible === 1 ? (
                          <FaCheckCircle className="w-4 h-4 text-green-600" />
                        ) : eligibilityResult?.eligible === 0 ? (
                          <FaExclamationTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <FaSearch className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          SHA Eligibility Status
                        </span>
                      </div>
                    </div>

                    {isCheckingEligibility ? (
                      <p className="text-xs text-blue-600">
                        Checking eligibility...
                      </p>
                    ) : eligibilityResult ? (
                      <div>
                        <p
                          className={`text-xs ${
                            eligibilityResult.eligible === 1
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {eligibilityResult.eligible === 1
                            ? "✅ Patient is eligible for SHA coverage"
                            : `❌ ${eligibilityResult.reason}`}
                        </p>
                        {eligibilityResult.possible_solution && (
                          <p className="text-xs text-blue-700 mt-1">
                            💡 {eligibilityResult.possible_solution}
                          </p>
                        )}
                      </div>
                    ) : selectedPatient?.sha_number ? (
                      <p className="text-xs text-gray-600">
                        Eligibility will be checked automatically...
                      </p>
                    ) : (
                      <p className="text-xs text-orange-600">
                        ⚠️ Please select a patient with SHA number for
                        eligibility check
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-1 md:pt-2">
            <button
              type="submit"
              disabled={!isComplete}
              className={`inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-xs md:text-sm transition-all duration-300 w-full sm:w-auto ${
                isComplete
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isComplete ? (
                <>
                  <span>Continue to Services</span>
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
