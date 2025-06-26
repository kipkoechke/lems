"use client";

import Modal from "@/components/Modal";
import { useFacilities } from "@/features/facilities/useFacilities";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronDown,
  FaCreditCard,
  FaExclamationTriangle,
  FaHeartbeat,
  FaHospital,
  FaMapMarkerAlt,
  FaPhone,
  FaPlay,
  FaSearch,
  FaShieldAlt,
  FaStar,
  FaStethoscope,
  FaTimes,
  FaUser,
  FaUserCheck,
  FaUserPlus,
  FaUserShield,
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

// Enhanced payment modes with descriptions and icons
const PAYMENT_MODES = [
  {
    paymentModeId: "sha",
    paymentModeName: "SHA",
    description: "Social Health Authority",
    icon: "🏥",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    popular: true,
  },
  {
    paymentModeId: "cash",
    paymentModeName: "CASH",
    description: "Direct cash payment",
    icon: "💵",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    popular: false,
  },
  {
    paymentModeId: "other_insurances",
    paymentModeName: "OTHER INSURANCES",
    description: "Third-party insurance coverage",
    icon: "🛡️",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
    popular: false,
  },
];

// Comprehensive workflow steps
const WORKFLOW_STEPS = [
  // Registration Phase
  {
    id: "facility",
    label: "Medical Facility",
    icon: FaHospital,
    description: "Select healthcare facility",
    color: "from-purple-500 to-purple-600",
    category: "registration",
  },
  {
    id: "patient",
    label: "Patient Details",
    icon: FaUser,
    description: "Patient information",
    color: "from-blue-500 to-blue-600",
    category: "registration",
  },
  {
    id: "payment",
    label: "Payment Method",
    icon: FaCreditCard,
    description: "Select payment option",
    color: "from-green-500 to-green-600",
    category: "registration",
  },

  // Service Phase
  {
    id: "recommendation",
    label: "Service Selection",
    icon: FaStethoscope,
    description: "Choose diagnostic service",
    color: "from-indigo-500 to-indigo-600",
    category: "service",
  },
  {
    id: "booking",
    label: "Service Booking",
    icon: FaUserCheck,
    description: "Schedule and confirm",
    color: "from-teal-500 to-teal-600",
    category: "service",
  },
  {
    id: "consent",
    label: "Patient Consent",
    icon: FaUserShield,
    description: "Verify patient consent",
    color: "from-orange-500 to-orange-600",
    category: "service",
  },

  // Fulfillment Phase
  {
    id: "proceedToTests",
    label: "Proceed to Tests",
    icon: FaPlay,
    description: "Begin service delivery",
    color: "from-pink-500 to-pink-600",
    category: "fulfillment",
  },
];

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  onStepOneComplete,
  onCloseModal,
}) => {
  const { patients } = usePatients();
  const { facilities } = useFacilities();

  const [selectedid, setSelectedid] = useState<string>("");
  const [selectedPaymentModeId, setSelectedPaymentModeId] =
    useState<string>("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");

  // Facility dropdown state
  const [facilitySearch, setFacilitySearch] = useState<string>("");
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] =
    useState<boolean>(false);
  const facilityDropdownRef = useRef<HTMLDivElement>(null);
  const facilitySearchRef = useRef<HTMLInputElement>(null);

  // For registering a new patient
  const { registerPatients, isRegistering } = useRegisterPatient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string; phone: string; date_of_birth: string }>();

  // Filter facilities based on search - Add null safety checks
  const filteredFacilities = facilities
    ?.filter(
      (facility) =>
        facility.name?.toLowerCase().includes(facilitySearch.toLowerCase()) ||
        facility.code?.toLowerCase().includes(facilitySearch.toLowerCase())
    )
    .slice(0, 50);

  // Get selected facility name for display
  const selectedFacility = facilities?.find((f) => f.id === selectedFacilityId);
  const selectedPatient = patients?.find((p) => p.id === selectedid);
  const selectedPaymentMode = PAYMENT_MODES.find(
    (mode) => mode.paymentModeId === selectedPaymentModeId
  );

  // Progress calculation
  const registrationSteps = WORKFLOW_STEPS.filter(
    (step) => step.category === "registration"
  );
  const completedRegistrationSteps = [
    ...(selectedFacilityId ? ["facility"] : []),
    ...(selectedid ? ["patient"] : []),
    ...(selectedPaymentModeId ? ["payment"] : []),
  ];
  const registrationProgress = completedRegistrationSteps.length;
  const overallProgress = Math.round(
    (completedRegistrationSteps.length / WORKFLOW_STEPS.length) * 100
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        facilityDropdownRef.current &&
        !facilityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFacilityDropdownOpen(false);
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

  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacilityId(facility.id);
    setIsFacilityDropdownOpen(false);
    setFacilitySearch("");
  };

  const clearFacilitySelection = () => {
    setSelectedFacilityId("");
    setFacilitySearch("");
  };

  const handleAddPatient = (data: {
    name: string;
    phone: string;
    date_of_birth: string;
  }) => {
    registerPatients(data, {
      onSuccess: (newPatient: Patient) => {
        setSelectedid(newPatient.id);
        reset();
        onCloseModal?.();
      },
    });
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients?.find((p) => p.id === selectedid);
    const facility = facilities?.find((f) => f.id === selectedFacilityId);

    if (!patient || !selectedPaymentModeId || !selectedFacilityId || !facility)
      return;

    onStepOneComplete?.(patient, selectedPaymentModeId, facility);
  };

  const inputClasses = `
    w-full p-4 border-2 border-gray-200 rounded-2xl 
    focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500
    transition-all duration-300 ease-out
    hover:border-blue-300 hover:shadow-lg
    disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed
    placeholder:text-gray-400 backdrop-blur-sm
  `;

  const labelClasses = `
    block text-gray-800 font-bold mb-4 text-lg flex items-center gap-3
  `;

  const cardClasses = `
    bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 
    transition-all duration-500 hover:shadow-2xl hover:border-blue-200/50
    hover:bg-white/90 hover:scale-[1.02] group
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Hero Header Section with Overall Workflow Progress */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
            <FaStar className="text-purple-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Healthcare Workflow • Step 1 of 7
            </span>
            <FaHeartbeat className="text-red-500 animate-pulse" />
          </div>

          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4">
            Patient Registration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Begin your healthcare journey with our comprehensive registration
            system
          </p>

          {/* Overall Workflow Progress */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                Complete Workflow Progress
              </span>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {overallProgress}% Complete •{" "}
                {completedRegistrationSteps.length}/{WORKFLOW_STEPS.length}{" "}
                Steps
              </span>
            </div>

            {/* Mini workflow steps */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              {WORKFLOW_STEPS.map((step, index) => {
                const isCompleted = completedRegistrationSteps.includes(
                  step.id
                );
                const isCurrent =
                  step.category === "registration" &&
                  ((step.id === "facility" && !selectedFacilityId) ||
                    (step.id === "patient" &&
                      selectedFacilityId &&
                      !selectedid) ||
                    (step.id === "payment" &&
                      selectedFacilityId &&
                      selectedid &&
                      !selectedPaymentModeId));

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 scale-125"
                          : isCurrent
                          ? "bg-blue-500 scale-110 animate-pulse"
                          : step.category === "registration"
                          ? "bg-blue-300"
                          : "bg-gray-300"
                      }`}
                      title={`${step.label} - ${step.description}`}
                    />
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <div
                        className={`w-6 h-0.5 transition-all duration-300 ${
                          isCompleted ? "bg-green-400" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Phase indicators */}
            <div className="flex justify-center space-x-8 text-xs">
              {["registration", "service", "fulfillment"].map(
                (phase, index) => {
                  const phaseSteps = WORKFLOW_STEPS.filter(
                    (s) => s.category === phase
                  );
                  const phaseCompleted = completedRegistrationSteps.filter(
                    (id) => phaseSteps.find((s) => s.id === id)
                  ).length;
                  const isCurrentPhase = phase === "registration";

                  return (
                    <div
                      key={phase}
                      className={`text-center ${
                        isCurrentPhase
                          ? "text-blue-600 font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      <div className="capitalize font-semibold">{phase}</div>
                      <div className="text-xs">
                        {phaseCompleted}/{phaseSteps.length}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleProceed} className="space-y-12">
          {/* Registration Phase Steps */}
          <div className={`${cardClasses} mb-8`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FaUser className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Registration Phase
                  </h2>
                  <p className="text-gray-600">
                    Complete these 3 steps to begin your healthcare journey
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {registrationProgress}/3
                </div>
                <div className="text-sm text-gray-600">Steps Complete</div>
              </div>
            </div>

            {/* Registration Steps Progress */}
            <div className="flex items-center space-x-6 mb-8 overflow-x-auto">
              {registrationSteps.map((step, index) => {
                const isCompleted = completedRegistrationSteps.includes(
                  step.id
                );
                const isCurrent =
                  (step.id === "facility" && !selectedFacilityId) ||
                  (step.id === "patient" &&
                    selectedFacilityId &&
                    !selectedid) ||
                  (step.id === "payment" &&
                    selectedFacilityId &&
                    selectedid &&
                    !selectedPaymentModeId);
                const IconComponent = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center group min-w-max">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                          isCompleted
                            ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-200 scale-110"
                            : isCurrent
                            ? `bg-gradient-to-r ${step.color} text-white shadow-xl scale-105 animate-pulse`
                            : "bg-white/80 backdrop-blur-sm text-gray-400 border-2 border-gray-200 group-hover:border-blue-300"
                        }`}
                      >
                        {isCompleted ? (
                          <FaCheckCircle className="w-7 h-7 animate-bounce" />
                        ) : (
                          <IconComponent className="w-7 h-7 transition-all duration-300 group-hover:scale-110" />
                        )}
                      </div>
                      <div className="text-center mt-3 max-w-24">
                        <div className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                          {step.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < registrationSteps.length - 1 && (
                      <div
                        className={`w-12 h-1 rounded-full transition-all duration-500 flex-shrink-0 ${
                          isCompleted
                            ? "bg-gradient-to-r from-green-400 to-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Main Content - Facility and Patient in Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Step 1: Facility Selection */}
            <div className={cardClasses}>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <FaHospital className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    Medical Facility
                  </h3>
                  <p className="text-gray-600">
                    Choose your preferred healthcare facility
                  </p>
                </div>
              </div>

              <div className="relative" ref={facilityDropdownRef}>
                <div
                  className={`${inputClasses} cursor-pointer flex items-center justify-between ${
                    isFacilityDropdownOpen
                      ? "ring-4 ring-purple-100 border-purple-500 shadow-xl"
                      : selectedFacility
                      ? "border-green-400 bg-green-50/50 shadow-lg"
                      : ""
                  }`}
                  onClick={() =>
                    setIsFacilityDropdownOpen(!isFacilityDropdownOpen)
                  }
                >
                  <div className="flex items-center gap-4">
                    {selectedFacility && (
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                    <span
                      className={
                        selectedFacility
                          ? "text-gray-900 font-bold"
                          : "text-gray-500"
                      }
                    >
                      {selectedFacility
                        ? `${selectedFacility.name}`
                        : "Select your medical facility"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedFacility && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFacilitySelection();
                        }}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    )}
                    <FaChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        isFacilityDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {selectedFacility && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-center gap-3 text-green-800">
                      <FaMapMarkerAlt className="w-5 h-5" />
                      <span className="font-bold">
                        Facility Code: {selectedFacility.code}
                      </span>
                    </div>
                  </div>
                )}

                {isFacilityDropdownOpen && (
                  <div className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-2xl max-h-80 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          ref={facilitySearchRef}
                          type="text"
                          placeholder="Search facilities by name or code..."
                          value={facilitySearch}
                          onChange={(e) => setFacilitySearch(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {facilities && (
                        <div className="mt-3 text-sm text-gray-600 bg-purple-50 px-3 py-2 rounded-lg">
                          {filteredFacilities?.length || 0} of{" "}
                          {facilities.length} facilities available
                        </div>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredFacilities && filteredFacilities.length > 0 ? (
                        filteredFacilities.map((facility) => (
                          <div
                            key={facility.id}
                            className="px-6 py-5 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:shadow-md"
                            onClick={() => handleFacilitySelect(facility)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-purple-100 rounded-xl">
                                <FaHospital className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-base">
                                  {facility.name}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Code: {facility.code}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-12 text-center text-gray-500">
                          <FaExclamationTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <div className="text-base font-semibold">
                            {facilitySearch
                              ? "No facilities found matching your search"
                              : "No facilities available"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Patient Selection */}
            <div className={cardClasses}>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <FaUser className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">
                    Patient Details
                  </h3>
                  <p className="text-gray-600">
                    Select existing or register new patient
                  </p>
                </div>
              </div>

              <div className="relative">
                <Modal>
                  <Modal.Open opens="patient-form">
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100 z-10 shadow-xl hover:shadow-2xl hover:scale-110"
                      title="Add new patient"
                    >
                      <FaUserPlus className="w-5 h-5" />
                    </button>
                  </Modal.Open>
                  <Modal.Window name="patient-form">
                    <div className="p-8 max-w-md mx-auto">
                      <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <FaUserPlus className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-2">
                          Register New Patient
                        </h3>
                        <p className="text-gray-600">
                          Fill in the patient details below
                        </p>
                      </div>

                      <form
                        onSubmit={handleSubmit(handleAddPatient)}
                        className="space-y-6"
                      >
                        <div>
                          <label className={labelClasses}>
                            <FaUser className="text-blue-500" />
                            Full Name
                          </label>
                          <input
                            {...register("name", {
                              required: "Name is required",
                            })}
                            className={inputClasses}
                            placeholder="Enter patient's full name"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className={labelClasses}>
                            <FaPhone className="text-green-500" />
                            Contact Number
                          </label>
                          <input
                            {...register("phone", {
                              required: "Contact number is required",
                              pattern: {
                                value: /^\d{10}$/,
                                message:
                                  "Please enter a valid 10-digit phone number",
                              },
                            })}
                            className={inputClasses}
                            placeholder="10-digit phone number"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className={labelClasses}>
                            <FaCalendarAlt className="text-purple-500" />
                            Date of Birth
                          </label>
                          <input
                            {...register("date_of_birth", {
                              required: "Date of birth is required",
                            })}
                            type="date"
                            className={inputClasses}
                          />
                          {errors.date_of_birth && (
                            <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.date_of_birth.message}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end pt-6">
                          <button
                            type="submit"
                            disabled={isRegistering}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:scale-105"
                          >
                            {isRegistering ? (
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Registering...
                              </div>
                            ) : (
                              "Register Patient"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </Modal.Window>
                </Modal>

                <select
                  value={selectedid}
                  onChange={(e) => setSelectedid(e.target.value)}
                  className={`${inputClasses} ${
                    selectedPatient
                      ? "border-green-400 bg-green-50/50 shadow-lg"
                      : ""
                  }`}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatient && (
                <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-base font-bold text-green-800">
                      Patient Selected: {selectedPatient.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Payment Mode - Full Width Horizontal */}
          <div className={`${cardClasses} w-full`}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
                <FaCreditCard className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  Payment Method
                </h3>
                <p className="text-gray-600">
                  Choose your preferred payment option
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PAYMENT_MODES.map((paymentMode) => (
                <label
                  key={paymentMode.paymentModeId}
                  className={`relative flex flex-col items-center p-8 border-3 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group ${
                    selectedPaymentModeId === paymentMode.paymentModeId
                      ? `${paymentMode.borderColor} ${paymentMode.bgColor} shadow-xl scale-105`
                      : "border-gray-200 hover:border-blue-300"
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

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-6xl mb-2">{paymentMode.icon}</div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-black text-gray-900 text-lg">
                          {paymentMode.paymentModeName}
                        </span>
                        {paymentMode.popular && (
                          <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {paymentMode.description}
                      </p>
                    </div>
                  </div>

                  {selectedPaymentModeId === paymentMode.paymentModeId && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <FaCheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${paymentMode.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  ></div>
                </label>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          {registrationProgress > 0 && (
            <div
              className={`${cardClasses} bg-gradient-to-r from-blue-50/80 to-purple-50/80`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <FaShieldAlt className="text-white w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  Registration Summary
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {selectedFacility && (
                  <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FaHospital className="text-purple-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Medical Facility
                      </div>
                      <div className="font-black text-gray-900 text-lg">
                        {selectedFacility.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Code: {selectedFacility.code}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPatient && (
                  <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FaUser className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Patient
                      </div>
                      <div className="font-black text-gray-900 text-lg">
                        {selectedPatient.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Phone: {selectedPatient.phone}
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMode && (
                  <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl backdrop-blur-sm">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FaCreditCard className="text-green-600 w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        Payment Method
                      </div>
                      <div className="font-black text-gray-900 text-lg">
                        {selectedPaymentMode.paymentModeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedPaymentMode.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Action Button */}
          <div className="flex justify-center pt-8">
            <button
              type="submit"
              className={`group relative px-16 py-6 font-black text-xl rounded-full transition-all duration-500 shadow-2xl flex items-center gap-4 ${
                registrationProgress === 3
                  ? "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 hover:shadow-3xl hover:scale-110 focus:ring-8 focus:ring-green-200"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={registrationProgress !== 3}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                {registrationProgress === 3 ? (
                  <>
                    <FaCheckCircle className="w-6 h-6" />
                    Continue to Service Selection
                    <FaArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle className="w-6 h-6" />
                    Complete {3 - registrationProgress} more step
                    {3 - registrationProgress > 1 ? "s" : ""} to continue
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Next Phase Preview */}
          {registrationProgress === 3 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl border border-indigo-200 shadow-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <FaStethoscope className="text-indigo-600 w-8 h-8" />
                  <h3 className="text-2xl font-black text-gray-900">
                    Next: Service Selection Phase
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Choose your diagnostic service and schedule your appointment
                </p>

                {/* Next phase steps preview */}
                <div className="flex items-center justify-center space-x-6">
                  {WORKFLOW_STEPS.filter((s) => s.category === "service").map(
                    (step, index) => {
                      const IconComponent = step.icon;
                      return (
                        <React.Fragment key={step.id}>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-gray-200 flex items-center justify-center shadow-md">
                              <IconComponent className="w-6 h-6 text-gray-400" />
                            </div>
                            <span className="text-xs font-semibold text-gray-600 mt-2 text-center max-w-16">
                              {step.label}
                            </span>
                          </div>
                          {index < 2 && (
                            <div className="w-8 h-0.5 bg-gray-300 rounded-full" />
                          )}
                        </React.Fragment>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
