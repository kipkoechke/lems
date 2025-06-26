"use client";

import Modal from "@/components/Modal";
import {
  goToNextStep,
  selectFacility,
  selectPaymentMode,
  setPatient,
} from "@/context/workflowSlice";
import { useFacilities } from "@/features/facilities/useFacilities";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaArrowRight,
  FaCheckCircle,
  FaChevronDown,
  FaCreditCard,
  FaHospital,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaStethoscope,
  FaTimes,
  FaUserPlus,
  FaUsers,
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

// Enhanced payment modes with styling
const PAYMENT_MODES = [
  {
    paymentModeId: "sha",
    paymentModeName: "SHA",
    icon: "🏥",
    description: "Social Health Authority",
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  {
    paymentModeId: "cash",
    paymentModeName: "CASH",
    icon: "💰",
    description: "Direct Payment",
    gradient: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  {
    paymentModeId: "other_insurances",
    paymentModeName: "INSURANCE",
    icon: "🛡️",
    description: "Private Insurance",
    gradient: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
  },
];

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  onStepOneComplete,
  onCloseModal,
}) => {
  const dispatch = useAppDispatch();
  const { patients } = usePatients();
  const { facilities } = useFacilities();
  const { registerPatients, isRegistering } = useRegisterPatient();

  // Get current workflow state
  const workflow = useAppSelector((store) => store.workflow);

  // Initialize with existing workflow state if available
  const [selectedid, setSelectedid] = useState<string>(
    workflow.patient?.id || ""
  );
  const [selectedPaymentModeId, setSelectedPaymentModeId] = useState<string>(
    workflow.selectedPaymentMode?.paymentModeId || ""
  );
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    workflow.selectedFacility?.id || ""
  );

  const [registrationMode, setRegistrationMode] = useState<
    "select" | "register" | null
  >(selectedid ? "select" : null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Facility dropdown state
  const [facilitySearch, setFacilitySearch] = useState<string>("");
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] =
    useState<boolean>(false);
  const facilityDropdownRef = useRef<HTMLDivElement>(null);
  const facilitySearchRef = useRef<HTMLInputElement>(null);

  // For registering a new patient
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<{
    name: string;
    phone: string;
    email?: string;
    date_of_birth: string;
  }>();

  // Watch form values for real-time validation feedback
  const watchedFields = watch();

  // Filter facilities based on search - Add null safety checks
  const filteredFacilities = facilities
    ?.filter(
      (facility) =>
        facility.name?.toLowerCase().includes(facilitySearch.toLowerCase()) ||
        facility.code?.toLowerCase().includes(facilitySearch.toLowerCase())
    )
    .slice(0, 50); // Limit to first 50 results for performance

  // Get selected facility name for display
  const selectedFacility = facilities?.find((f) => f.id === selectedFacilityId);
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

    // Update Redux state immediately - Fixed to use selectFacility
    dispatch(selectFacility(facility));
  };

  const clearFacilitySelection = () => {
    setSelectedFacilityId("");
    setFacilitySearch("");
    // Note: You might need to handle clearing facility in your slice
    // For now, we'll just clear the local state
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedid(patientId);
    const patient = patients?.find((p) => p.id === patientId);
    if (patient) {
      dispatch(setPatient(patient));
    }
  };

  const handlePaymentModeSelect = (paymentModeId: string) => {
    setSelectedPaymentModeId(paymentModeId);
    const paymentMode = PAYMENT_MODES.find(
      (pm) => pm.paymentModeId === paymentModeId
    );
    if (paymentMode) {
      // Fixed to use selectPaymentMode and match PaymentMode interface
      dispatch(
        selectPaymentMode({
          paymentModeId: paymentMode.paymentModeId,
          paymentModeName: paymentMode.paymentModeName,
        })
      );
    }
  };

  const handleAddPatient = (data: {
    name: string;
    phone: string;
    email?: string;
    date_of_birth: string;
  }) => {
    registerPatients(data, {
      onSuccess: (newPatient: Patient) => {
        setSelectedid(newPatient.id);
        dispatch(setPatient(newPatient));
        setShowSuccessMessage(true);
        reset();
        onCloseModal?.();

        setTimeout(() => setShowSuccessMessage(false), 3000);
      },
    });
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("handleProceed called", {
      selectedid,
      selectedPaymentModeId,
      selectedFacilityId,
      currentStep: workflow.currentStep,
    });

    const patient = patients?.find((p) => p.id === selectedid);
    const facility = facilities?.find((f) => f.id === selectedFacilityId);
    const paymentMode = PAYMENT_MODES.find(
      (pm) => pm.paymentModeId === selectedPaymentModeId
    );

    console.log("Found entities:", {
      patient: !!patient,
      facility: !!facility,
      paymentMode: !!paymentMode,
    });

    if (
      !patient ||
      !selectedPaymentModeId ||
      !selectedFacilityId ||
      !facility ||
      !paymentMode
    ) {
      console.log("Missing required fields:", {
        patient: !!patient,
        paymentMode: !!paymentMode,
        facility: !!facility,
      });
      return;
    }

    // Update Redux state with all selections - Fixed function names
    dispatch(setPatient(patient));
    dispatch(
      selectPaymentMode({
        paymentModeId: paymentMode.paymentModeId,
        paymentModeName: paymentMode.paymentModeName,
      })
    );
    dispatch(selectFacility(facility));

    console.log(
      "Dispatched to Redux, calling onStepOneComplete and goToNextStep"
    );

    // Call the callback if provided (for backward compatibility)
    onStepOneComplete?.(patient, selectedPaymentModeId, facility);

    // Move to next step
    dispatch(goToNextStep());
  };

  const canProceed = selectedid && selectedPaymentModeId && selectedFacilityId;

  // Landing page when no registration mode is selected
  if (!registrationMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-blue-900/90 to-indigo-900/95"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-24">
            <div className="text-center">
              {/* Logo and branding */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-3xl blur-lg animate-pulse"></div>
                  <div className="relative p-6 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <FaStethoscope className="w-10 h-10 text-white" />
                      <div className="text-left">
                        <h1 className="text-2xl font-bold text-white">LEMS</h1>
                        <p className="text-xs text-blue-200">
                          Vendor Equipment Management System
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Cards */}
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Register New Patient */}
                <div
                  onClick={() => setRegistrationMode("register")}
                  className="group relative bg-white/95 backdrop-blur-lg rounded-3xl p-10 shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500 cursor-pointer border border-white/30 overflow-hidden"
                >
                  {/* Card background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <div className="relative p-5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                        <FaUserPlus className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                      New Patient
                    </h3>

                    <p className="text-gray-600 text-center mb-8 leading-relaxed">
                      Start your healthcare journey with us. Create your
                      comprehensive patient profile and unlock access to premium
                      medical equipment and services.
                    </p>

                    <div className="flex items-center text-emerald-600 font-semibold text-lg group-hover:translate-x-3 transition-transform duration-300">
                      Register Now{" "}
                      <FaArrowRight className="ml-3 group-hover:animate-pulse" />
                    </div>

                    {/* Features list */}
                    <div className="mt-6 space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Quick 2-minute registration</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Secure data protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Instant access to services</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Existing Patient */}
                <div
                  onClick={() => setRegistrationMode("select")}
                  className="group relative bg-white/95 backdrop-blur-lg rounded-3xl p-10 shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500 cursor-pointer border border-white/30 overflow-hidden"
                >
                  {/* Card background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                      <div className="relative p-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                        <FaUsers className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                      Existing Patient
                    </h3>

                    <p className="text-gray-600 text-center mb-8 leading-relaxed">
                      Welcome back! Access your existing profile and continue
                      with your personalized healthcare services and equipment
                      management.
                    </p>

                    <div className="flex items-center text-blue-600 font-semibold text-lg group-hover:translate-x-3 transition-transform duration-300">
                      Access Profile{" "}
                      <FaArrowRight className="ml-3 group-hover:animate-pulse" />
                    </div>

                    {/* Features list */}
                    <div className="mt-6 space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Instant profile access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Personalized recommendations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Service history tracking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="relative py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Why Choose <span className="text-blue-600">LEMS</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Experience healthcare like never before with our cutting-edge
                platform designed for excellence, efficiency, and your peace of
                mind.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-600/10 rounded-2xl group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
                    <FaStethoscope className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Premium Equipment
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Access to state-of-the-art medical equipment and cutting-edge
                  healthcare technology.
                </p>
              </div>

              <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 transition-all duration-300 hover:shadow-lg">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-emerald-600/10 rounded-2xl group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
                    <FaCheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Seamless Process
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Streamlined workflows from registration to service delivery
                  with minimal waiting time.
                </p>
              </div>

              <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-purple-600/10 rounded-2xl group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
                    <FaCreditCard className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Flexible Payment
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Multiple payment options including SHA, insurance, and direct
                  payment methods.
                </p>
              </div>

              <div className="group text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 transition-all duration-300 hover:shadow-lg">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-orange-600/10 rounded-2xl group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="relative p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center">
                    <FaShieldAlt className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Secure & Private
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced security measures to protect your personal and
                  medical information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative py-20 bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  50K+
                </div>
                <div className="text-blue-200">Happy Patients</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  200+
                </div>
                <div className="text-blue-200">Medical Facilities</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  99.9%
                </div>
                <div className="text-blue-200">System Uptime</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-blue-200">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRegistrationMode(null)}
                className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 text-gray-600 hover:text-blue-600"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <FaStethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    LEMS
                  </span>
                  <p className="text-xs text-gray-500">
                    Laboratory Equipment Management
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-4 py-2 rounded-full font-medium ${
                    registrationMode === "register"
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-2 bg-emerald-500 rounded-full">
              <FaCheckCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-700">Success!</h4>
              <p className="text-emerald-600">
                Patient registered successfully!
              </p>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Enhanced Progress Steps */}
          <div className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 px-8 py-8">
            <div className="flex items-center justify-center gap-12 text-white">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
                </div>
                <div>
                  <span className="font-semibold text-lg">
                    Patient Registration
                  </span>
                  <p className="text-blue-200 text-sm">Setup your profile</p>
                </div>
              </div>

              <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-gradient-to-r from-white/50 to-white/30 rounded-full"></div>
              </div>

              <div className="flex items-center gap-4 opacity-50">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div>
                  <span className="font-semibold text-lg">
                    Service Selection
                  </span>
                  <p className="text-blue-200 text-sm">Choose your services</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleProceed} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Enhanced Patient Selection/Registration */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                    {registrationMode === "register" ? (
                      <FaUserPlus className="w-6 h-6 text-white" />
                    ) : (
                      <FaUsers className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {registrationMode === "register"
                        ? "Register New Patient"
                        : "Select Patient"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {registrationMode === "register"
                        ? "Create your healthcare profile"
                        : "Choose from existing patients"}
                    </p>
                  </div>
                </div>

                {registrationMode === "select" ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <select
                        value={selectedid}
                        onChange={(e) => handlePatientSelect(e.target.value)}
                        className="w-full p-5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-lg"
                        required
                      >
                        <option value="">Select existing patient</option>
                        {patients?.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} - {patient.phone}
                          </option>
                        ))}
                      </select>
                      <FaUsers className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegistrationMode("register")}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center gap-3 group"
                    >
                      <FaUserPlus className="w-5 h-5" />
                      <span>Register New Patient Instead</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Modal>
                      <Modal.Open opens="patient-form">
                        <button
                          type="button"
                          className="w-full p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-3 group shadow-lg"
                        >
                          <FaUserPlus className="w-6 h-6" />
                          <span className="text-lg font-semibold">
                            Register New Patient
                          </span>
                        </button>
                      </Modal.Open>
                      <Modal.Window name="patient-form">
                        <form
                          onSubmit={handleSubmit(handleAddPatient)}
                          className="space-y-6 p-6"
                        >
                          <h3 className="text-2xl font-bold text-gray-800 mb-6">
                            Patient Registration
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                Full Name *
                              </label>
                              <input
                                {...register("name", {
                                  required: "Name is required",
                                })}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                                placeholder="Enter full name"
                              />
                              {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.name.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                Contact Number *
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
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                                placeholder="10-digit phone number"
                              />
                              {errors.phone && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.phone.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                Email (Optional)
                              </label>
                              <input
                                {...register("email")}
                                type="email"
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                                placeholder="email@example.com"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                Date of Birth *
                              </label>
                              <input
                                {...register("date_of_birth", {
                                  required: "Date of birth is required",
                                })}
                                type="date"
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                              />
                              {errors.date_of_birth && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.date_of_birth.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-4 pt-6">
                            <button
                              type="submit"
                              disabled={isRegistering}
                              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3"
                            >
                              {isRegistering && (
                                <FaSpinner className="animate-spin" />
                              )}
                              {isRegistering
                                ? "Registering..."
                                : "Register Patient"}
                            </button>
                          </div>
                        </form>
                      </Modal.Window>
                    </Modal>

                    <button
                      type="button"
                      onClick={() => setRegistrationMode("select")}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-3 group"
                    >
                      <FaUsers className="w-5 h-5" />
                      <span>Select Existing Patient Instead</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced Payment Mode Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                    <FaCreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Payment Mode
                    </h3>
                    <p className="text-sm text-gray-500">
                      Choose your preferred payment method
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {PAYMENT_MODES.map((mode) => (
                    <div
                      key={mode.paymentModeId}
                      onClick={() =>
                        handlePaymentModeSelect(mode.paymentModeId)
                      }
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 group ${
                        selectedPaymentModeId === mode.paymentModeId
                          ? `${mode.bgColor} ${mode.borderColor} shadow-lg scale-105`
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{mode.icon}</div>
                        <div className="flex-1">
                          <h4
                            className={`font-bold text-lg ${
                              selectedPaymentModeId === mode.paymentModeId
                                ? mode.textColor
                                : "text-gray-800"
                            }`}
                          >
                            {mode.paymentModeName}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {mode.description}
                          </p>
                        </div>
                        {selectedPaymentModeId === mode.paymentModeId && (
                          <FaCheckCircle
                            className={`w-6 h-6 ${mode.textColor}`}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Facility Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl">
                    <FaHospital className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Medical Facility
                    </h3>
                    <p className="text-sm text-gray-500">
                      Select your preferred healthcare facility
                    </p>
                  </div>
                </div>

                <div className="relative" ref={facilityDropdownRef}>
                  <div
                    className={`w-full p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                      isFacilityDropdownOpen
                        ? "ring-4 ring-blue-500/20 border-blue-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setIsFacilityDropdownOpen(!isFacilityDropdownOpen)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={
                          selectedFacility ? "text-gray-900" : "text-gray-500"
                        }
                      >
                        {selectedFacility ? (
                          <div>
                            <div className="font-semibold">
                              {selectedFacility.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Code: {selectedFacility.code}
                            </div>
                          </div>
                        ) : (
                          "Select a medical facility"
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedFacility && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFacilitySelection();
                            }}
                            className="text-gray-400 hover:text-gray-600 p-2"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        )}
                        <FaChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isFacilityDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {isFacilityDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-80">
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            ref={facilitySearchRef}
                            type="text"
                            placeholder="Search facilities by name or code..."
                            value={facilitySearch}
                            onChange={(e) => setFacilitySearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {filteredFacilities && filteredFacilities.length > 0 ? (
                          filteredFacilities.map((facility) => (
                            <div
                              key={facility.id}
                              className="px-6 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                              onClick={() => handleFacilitySelect(facility)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-100 rounded-xl">
                                  <FaHospital className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 text-base">
                                    {facility.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Code: {facility.code}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-6 py-8 text-center text-gray-500">
                            {facilitySearch
                              ? "No facilities found matching your search"
                              : "No facilities available"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Proceed Button */}
            <div className="flex justify-center mt-12">
              <button
                type="submit"
                disabled={!canProceed}
                className={`px-12 py-6 font-bold text-xl rounded-2xl transition-all duration-200 flex items-center gap-4 ${
                  canProceed
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Proceed to Service Selection
                <FaArrowRight className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistration;
