"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaArrowRight,
  FaCheckCircle,
  FaChevronDown,
  FaCreditCard,
  FaHospital,
  FaSearch,
  FaSpinner,
  FaStethoscope,
  FaTimes,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";

// Mock data for demonstration
const mockPatients = [
  { id: "1", name: "John Doe", phone: "0712345678", email: "john@example.com" },
  {
    id: "2",
    name: "Jane Smith",
    phone: "0723456789",
    email: "jane@example.com",
  },
  {
    id: "3",
    name: "Mike Johnson",
    phone: "0734567890",
    email: "mike@example.com",
  },
];

const mockFacilities = [
  { id: "1", name: "Nairobi Hospital", code: "NH001", location: "Nairobi" },
  {
    id: "2",
    name: "Kenyatta National Hospital",
    code: "KNH002",
    location: "Nairobi",
  },
  { id: "3", name: "Aga Khan Hospital", code: "AKH003", location: "Nairobi" },
  { id: "4", name: "MP Shah Hospital", code: "MPS004", location: "Nairobi" },
];

const PAYMENT_MODES = [
  {
    paymentModeId: "sha",
    paymentModeName: "SHA",
    icon: "🏥",
    description: "Social Health Authority",
  },
  {
    paymentModeId: "cash",
    paymentModeName: "CASH",
    icon: "💰",
    description: "Direct Payment",
  },
  {
    paymentModeId: "other_insurances",
    paymentModeName: "INSURANCE",
    icon: "🛡️",
    description: "Private Insurance",
  },
];

interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Facility {
  id: string;
  name: string;
  code: string;
  location?: string;
}

const PatientRegistration: React.FC = () => {
  const [registrationMode, setRegistrationMode] = useState<
    "select" | "register" | null
  >(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPaymentModeId, setSelectedPaymentModeId] =
    useState<string>("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Facility dropdown state
  const [facilitySearch, setFacilitySearch] = useState<string>("");
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] =
    useState<boolean>(false);
  const facilityDropdownRef = useRef<HTMLDivElement>(null);
  const facilitySearchRef = useRef<HTMLInputElement>(null);

  // Form for new patient registration
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<{
    name: string;
    phone: string;
    email: string;
    date_of_birth: string;
  }>();

  // Watch form values for real-time validation feedback
  const watchedFields = watch();

  // Filter facilities based on search
  const filteredFacilities = mockFacilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      facility.code.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      facility.location?.toLowerCase().includes(facilitySearch.toLowerCase())
  );

  const selectedFacility = mockFacilities.find(
    (f) => f.id === selectedFacilityId
  );
  const selectedPaymentMode = PAYMENT_MODES.find(
    (pm) => pm.paymentModeId === selectedPaymentModeId
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

  const handleRegisterPatient = async (data: {
    name: string;
    phone: string;
    email: string;
    date_of_birth: string;
  }) => {
    setIsRegistering(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newPatient = {
      id: `new-${Date.now()}`,
      ...data,
    };

    setSelectedPatientId(newPatient.id);
    setIsRegistering(false);
    setShowSuccessMessage(true);
    reset();

    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle proceed logic here
    console.log({
      patientId: selectedPatientId,
      paymentMode: selectedPaymentModeId,
      facilityId: selectedFacilityId,
    });
  };

  const canProceed =
    selectedPatientId && selectedPaymentModeId && selectedFacilityId;

  if (!registrationMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  <FaStethoscope className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-6">
                Welcome to <span className="text-blue-200">MediCore</span>
              </h1>
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                Your gateway to seamless healthcare services. Register as a new
                patient or access your existing profile to continue.
              </p>

              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Register New Patient */}
                <div
                  onClick={() => setRegistrationMode("register")}
                  className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white/20"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FaUserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      New Patient
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                      First time here? Create your patient profile and get
                      started with our healthcare services.
                    </p>
                    <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Register Now <FaArrowRight className="ml-2" />
                    </div>
                  </div>
                </div>

                {/* Existing Patient */}
                <div
                  onClick={() => setRegistrationMode("select")}
                  className="group bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-white/20"
                >
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FaUsers className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Existing Patient
                    </h3>
                    <p className="text-gray-600 text-center mb-6">
                      Already registered? Select your profile from our system
                      and continue your healthcare journey.
                    </p>
                    <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Select Profile <FaArrowRight className="ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Why Choose MediCore?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience healthcare like never before with our cutting-edge
                platform designed for your convenience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FaStethoscope className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Care</h3>
                <p className="text-gray-600">
                  Access to top-tier medical facilities and healthcare
                  professionals.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FaCheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Process</h3>
                <p className="text-gray-600">
                  Streamlined registration and appointment booking process.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FaCreditCard className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Payment</h3>
                <p className="text-gray-600">
                  Multiple payment options including SHA, cash, and insurance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRegistrationMode(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <div className="flex items-center gap-2">
                <FaStethoscope className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-800">
                  MediCore
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span
                className={`px-3 py-1 rounded-full ${
                  registrationMode === "register"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {registrationMode === "register"
                  ? "New Patient"
                  : "Existing Patient"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <FaCheckCircle className="text-green-600" />
            <span className="text-green-700">
              Patient registered successfully!
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-center gap-8 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <span className="font-medium">Patient Info</span>
              </div>
              <div className="w-16 h-0.5 bg-white/30"></div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <span className="font-medium">Services</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleProceed} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Patient Selection/Registration */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {registrationMode === "register" ? (
                      <FaUserPlus className="w-5 h-5 text-blue-600" />
                    ) : (
                      <FaUsers className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {registrationMode === "register"
                      ? "Register New Patient"
                      : "Select Patient"}
                  </h3>
                </div>

                {registrationMode === "select" ? (
                  <div className="space-y-4">
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Choose existing patient</option>
                      {mockPatients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} - {patient.phone}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setRegistrationMode("register")}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      Register New Patient Instead
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        {...register("name", { required: "Name is required" })}
                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          errors.name
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        placeholder="Enter full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        {...register("phone", {
                          required: "Phone number is required",
                          pattern: {
                            value: /^07\d{8}$/,
                            message:
                              "Enter valid Kenyan phone number (07xxxxxxxx)",
                          },
                        })}
                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          errors.phone
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        placeholder="07xxxxxxxx"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        {...register("email", {
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                          },
                        })}
                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          errors.email
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        {...register("date_of_birth", {
                          required: "Date of birth is required",
                        })}
                        type="date"
                        className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          errors.date_of_birth
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                      />
                      {errors.date_of_birth && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.date_of_birth.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit(handleRegisterPatient)}
                      disabled={isRegistering}
                      className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isRegistering ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="w-4 h-4" />
                          Register Patient
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegistrationMode("select")}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <FaUsers className="w-4 h-4" />
                      Select Existing Patient Instead
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Mode */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaCreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Payment Method
                  </h3>
                </div>

                <div className="space-y-3">
                  {PAYMENT_MODES.map((mode) => (
                    <div
                      key={mode.paymentModeId}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedPaymentModeId === mode.paymentModeId
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() =>
                        setSelectedPaymentModeId(mode.paymentModeId)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{mode.icon}</div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {mode.paymentModeName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {mode.description}
                          </div>
                        </div>
                        {selectedPaymentModeId === mode.paymentModeId && (
                          <FaCheckCircle className="w-5 h-5 text-purple-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facility Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaHospital className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Medical Facility
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {mockFacilities.length} available
                  </span>
                </div>

                <div className="relative" ref={facilityDropdownRef}>
                  <div
                    className={`w-full p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      isFacilityDropdownOpen
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-green-400"
                    }`}
                    onClick={() =>
                      setIsFacilityDropdownOpen(!isFacilityDropdownOpen)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaHospital className="w-5 h-5 text-green-600" />
                        <div>
                          {selectedFacility ? (
                            <>
                              <div className="font-medium text-gray-800">
                                {selectedFacility.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                Code: {selectedFacility.code}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-500">
                              Select a medical facility
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedFacility && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFacilitySelection();
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        )}
                        <FaChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                            isFacilityDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {isFacilityDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-green-200 rounded-xl shadow-xl max-h-80">
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            ref={facilitySearchRef}
                            type="text"
                            placeholder="Search facilities..."
                            value={facilitySearch}
                            onChange={(e) => setFacilitySearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredFacilities.length > 0 ? (
                          filteredFacilities.map((facility) => (
                            <div
                              key={facility.id}
                              className="px-4 py-4 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                              onClick={() => handleFacilitySelect(facility)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <FaHospital className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {facility.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {facility.code} • {facility.location}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No facilities found matching your search
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedFacility && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <FaCheckCircle className="w-4 h-4" />
                      <span className="font-medium">Facility Selected</span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      {selectedFacility.name} - {selectedFacility.location}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary and Proceed */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">
                    Registration Summary
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedPatientId ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></span>
                      Patient: {selectedPatientId ? "Selected" : "Not selected"}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedPaymentModeId ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></span>
                      Payment:{" "}
                      {selectedPaymentMode?.paymentModeName || "Not selected"}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedFacilityId ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></span>
                      Facility: {selectedFacility?.name || "Not selected"}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canProceed}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                    canProceed
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span>Proceed to Services</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
