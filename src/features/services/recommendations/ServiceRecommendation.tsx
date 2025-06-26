"use client";

import {
  goToNextStep,
  goToPreviousStep,
  selectService,
  setBooking,
  setOtpCode,
} from "@/context/workflowSlice";
import { usePatients } from "@/features/patients/usePatients";
import { useCreateBooking } from "@/features/services/bookings/useCreateBooking";
import { useServicesByFacilityCode } from "@/features/services/useServicesByFacilityCode";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";
import { FaStethoscope } from "react-icons/fa6";

const ServiceRecommendation: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = usePatients();
  const { createBooking, isCreating } = useCreateBooking();

  // Get patient/payment/facility from redux (set in step 1)
  const workflow = useAppSelector((store) => store.workflow);
  const selectedPatientId = workflow.patient?.id || "";

  // Use the correct property names based on your workflow slice
  const selectedPaymentModeId =
    workflow.selectedPaymentMode?.paymentModeId || "";
  const selectedFacilityId = workflow.selectedFacility?.id || "";
  const facilityCode = workflow.selectedFacility?.code || "";

  console.log("ServiceRecommendation workflow state:", {
    patient: workflow.patient,
    paymentMode: workflow.selectedPaymentMode,
    facility: workflow.selectedFacility,
    facilityCode,
    fullWorkflow: workflow,
  });

  // Get services based on facility code - now returns FacilityContract[]
  const { contracts, isServicesLoading, error } =
    useServicesByFacilityCode(facilityCode);

  // Two-level selection state
  const [selectedContractId, setSelectedContractId] = useState<string>(""); // For diagnostic service (category)
  const [selectedServiceId, setSelectedServiceId] = useState<string>(""); // For individual service
  const [bookingDate, setBookingDate] = useState<string>("");
  const [isOverrideMode, setIsOverrideMode] = useState<boolean>(false);

  // Booking state
  const [bookingCreated, setBookingCreated] = useState<boolean>(false);
  const booking = useAppSelector((store) => store.workflow.booking);

  // Get the selected contract (diagnostic service category)
  const selectedContract = contracts?.find((c) => c.id === selectedContractId);

  // Get available services for the selected contract
  const availableServices =
    selectedContract?.services.filter((s) => s.is_active === "1") || [];

  // Handle contract selection (diagnostic service category)
  const handleContractChange = (contractId: string) => {
    setSelectedContractId(contractId);
    setSelectedServiceId(""); // Reset service selection when contract changes
  };

  // Validate all fields for booking
  const validateAllFields = () => {
    const patient = patients?.find((p) => p.id === selectedPatientId);
    const facility = workflow.selectedFacility;

    // Find the selected service and contract
    let selectedService = null;
    let selectedContract = null;

    for (const contract of contracts) {
      const service = contract.services.find(
        (s) => s.service_code === selectedServiceId
      );
      if (service) {
        selectedService = service;
        selectedContract = contract;
        break;
      }
    }

    // Create hardcoded payment mode object
    const paymentModeMap: Record<string, any> = {
      sha: { paymentModeId: "sha", paymentModeName: "SHA" },
      cash: { paymentModeId: "cash", paymentModeName: "CASH" },
      other_insurances: {
        paymentModeId: "other_insurances",
        paymentModeName: "OTHER INSURANCES",
      },
    };
    const paymentMode = paymentModeMap[selectedPaymentModeId];

    if (
      !patient ||
      !selectedService ||
      !selectedContract ||
      !facility ||
      !paymentMode ||
      !bookingDate
    ) {
      return null;
    }

    return {
      patient,
      service: selectedService,
      contract: selectedContract,
      facility,
      paymentMode,
    };
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const validatedFields = validateAllFields();
    if (!validatedFields) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!bookingCreated) {
      createBookingFirst(validatedFields);
      return;
    }
    if (isOverrideMode) {
      handleOverrideFlow();
    } else {
      handleNormalFlow();
    }
  };

  const createBookingFirst = (validatedFields: any) => {
    const { patient, service, contract, facility, paymentMode } =
      validatedFields;

    // Create a service object for the workflow state
    const serviceForWorkflow = {
      serviceId: service.service_code,
      serviceName: service.service_name,
      description: `${contract.lot_name} - ${service.service_name}`,
      shaRate: "0",
      vendorShare: "0",
      facilityShare: "0",
      capitated: "0",
      created_at: "",
      updatedAt: "",
      deletedAt: null,
      category: contract.category,
    };

    dispatch(selectService(serviceForWorkflow));

    // Format the booking data according to the API requirements
    const bookingData = {
      service_id: service.service_id,
      patient_id: patient.id,
      payment_mode: selectedPaymentModeId, // Use the payment mode ID directly as string
      booking_date: new Date(bookingDate)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "), // Convert to Y-m-d H:i:s format
      override: isOverrideMode, // Pass override flag based on current mode
    };

    createBooking(bookingData, {
      onSuccess: (response) => {
        console.log("=== BOOKING CREATION RESPONSE ===");
        console.log("Full response:", response);
        console.log("Response keys:", Object.keys(response));
        console.log("Booking object:", response.booking);
        console.log("Booking object keys:", Object.keys(response.booking));
        console.log("OTP code:", response.otp_code);

        // Log all possible booking identifier fields
        console.log("=== BOOKING IDENTIFIER ANALYSIS ===");
        console.log("booking.bookingId:", response.booking.bookingId);
        console.log("booking.id:", (response.booking as any).id);
        console.log(
          "booking.booking_id:",
          (response.booking as any).booking_id
        );
        console.log("booking.number:", (response.booking as any).number);
        console.log(
          "booking.booking_number:",
          (response.booking as any).booking_number
        );

        console.log(
          "All booking fields:",
          JSON.stringify(response.booking, null, 2)
        );
        toast.success("Booking created successfully!");
        dispatch(setBooking(response.booking));
        dispatch(setOtpCode(response.otp_code)); // Store OTP in workflow state
        console.log("Setting OTP code in workflow:", response.otp_code);
        setBookingCreated(true);

        // Handle OTP that comes directly from booking creation
        if (response.otp_code) {
          // Just store the OTP and go to consent step for validation
          dispatch(goToNextStep()); // Go to consent step where OTP validation will happen
        } else {
          toast.error("No OTP code received from booking creation.");
        }
      },
      onError: () => {
        toast.error("Failed to create booking");
      },
    });
  };

  const handleNormalFlow = () => {
    // Go to consent step for OTP validation
    dispatch(goToNextStep());
  };

  const handleOverrideFlow = () => {
    // Go to consent step for override OTP validation
    dispatch(goToNextStep());
  };

  const inputClasses = `
    w-full h-12 px-4 py-3
    border border-gray-300 rounded-lg
    bg-white text-gray-900 text-sm
    placeholder:text-gray-500
    transition-all duration-200 ease-in-out
    hover:border-blue-400 hover:shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  const labelClasses = `
    block text-sm font-semibold text-gray-700 mb-2
  `;

  const buttonClasses = `
    px-6 py-3 min-w-[140px]
    font-semibold text-sm
    rounded-lg shadow-sm
    transition-all duration-200
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
    hover:shadow-md
    flex items-center justify-center
    disabled:cursor-not-allowed
  `;

  return (
    <div className="max-w-5xl mx-auto">
      <form
        className="bg-white shadow-xl rounded-2xl px-8 py-6 border border-gray-100"
        onSubmit={handleSubmitBooking}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaStethoscope className="text-blue-600 text-xl" />
            </div>
            Book a Medical Service
          </h2>
          <p className="text-gray-600">
            Complete the form below to schedule your appointment
          </p>

          {/* Show selected facility info */}
          {workflow.selectedFacility && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                <strong>Selected Facility:</strong>{" "}
                {workflow.selectedFacility.name} (
                {workflow.selectedFacility.code})
              </p>
            </div>
          )}

          {/* Show available categories from contracts */}
          {contracts.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-semibold mb-2">
                Available Service Categories:
              </p>
              <div className="flex flex-wrap gap-2">
                {contracts.map((contract) => (
                  <span
                    key={contract.id}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    LOT {contract.lot_number} - {contract.lot_name} (
                    {
                      contract.services.filter((s) => s.is_active === "1")
                        .length
                    }{" "}
                    services)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        {bookingCreated && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <div className="p-1 bg-green-100 rounded-full mr-3">
                <FaCheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-green-800 font-semibold">
                Booking Created Successfully
              </span>
            </div>
            <p className="text-green-700 text-sm mt-2 ml-8">
              Booking ID:{" "}
              <span className="font-mono bg-green-100 px-2 py-1 rounded">
                {booking?.bookingId || "Generated"}
              </span>
              {isOverrideMode
                ? " - Ready for emergency override verification"
                : " - Ready for patient consent verification"}
            </p>
          </div>
        )}

        {isOverrideMode && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center">
              <div className="p-1 bg-amber-100 rounded-full mr-3">
                <FaExclamationTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-amber-800 font-semibold">
                Emergency Override Mode Active
              </span>
            </div>
            <p className="text-amber-700 text-sm mt-2 ml-8">
              This booking will bypass patient consent verification and require
              manager approval.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 1. Diagnostic Service Selection (Categories) */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <div className="flex items-center gap-2">
                <FaStethoscope className="text-green-600" />
                Diagnostic Service
                {contracts.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {contracts.length} categories
                  </span>
                )}
              </div>
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => handleContractChange(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated || isServicesLoading || !facilityCode}
            >
              <option value="">
                {isServicesLoading
                  ? "Loading categories..."
                  : !facilityCode
                  ? "Please select a facility first"
                  : "Select diagnostic service"}
              </option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  LOT {contract.lot_number} - {contract.lot_name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Service Name Selection */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <div className="flex items-center gap-2">
                <FaStethoscope className="text-blue-600" />
                Service Name
                {availableServices.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {availableServices.length} services
                  </span>
                )}
              </div>
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className={inputClasses}
              required
              disabled={
                bookingCreated || isServicesLoading || !selectedContractId
              }
            >
              <option value="">
                {!selectedContractId
                  ? "Select diagnostic service first"
                  : availableServices.length === 0
                  ? "No services available"
                  : "Select service"}
              </option>
              {availableServices.map((service) => (
                <option key={service.service_code} value={service.service_code}>
                  {service.service_name} ({service.service_code})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Booking Date & Time */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-pink-600" />
                Appointment Date & Time
              </div>
            </label>
            <input
              type="datetime-local"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        {/* Selected Service Details */}
        {selectedServiceId && selectedContract && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
            {(() => {
              const selectedService = availableServices.find(
                (s) => s.service_code === selectedServiceId
              );
              return selectedService ? (
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Selected Service Details:
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        Category:
                      </span>
                      <p className="text-gray-600">
                        LOT {selectedContract.lot_number} -{" "}
                        {selectedContract.lot_name}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Service:
                      </span>
                      <p className="text-gray-600">
                        {selectedService.service_name}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Service Code:
                      </span>
                      <p className="text-gray-600">
                        {selectedService.service_code}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Vendor:</span>
                      <p className="text-gray-600">
                        {selectedContract.vendor_name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Emergency Override Toggle & Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500" />
              Emergency Override
            </label>
            <button
              type="button"
              onClick={() => {
                if (bookingCreated) {
                  toast("Cannot change override mode after booking is created");
                  return;
                }
                setIsOverrideMode(!isOverrideMode);
              }}
              disabled={bookingCreated}
              className={`
                relative inline-flex h-7 w-12 items-center rounded-full
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                ${
                  bookingCreated
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
                ${isOverrideMode ? "bg-amber-500 shadow-md" : "bg-gray-300"}
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 transform rounded-full bg-white shadow-sm
                  transition-transform duration-200 ease-in-out
                  ${isOverrideMode ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
            {isOverrideMode && (
              <span className="text-xs text-amber-600 font-medium">ACTIVE</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => dispatch(goToPreviousStep())}
              className={`${buttonClasses} border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-400`}
              disabled={bookingCreated}
            >
              <span>← Back</span>
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className={`
                ${buttonClasses}
                ${
                  isOverrideMode
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:ring-amber-500 disabled:from-amber-300 disabled:to-orange-300"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 disabled:from-gray-400 disabled:to-gray-500"
                }
                text-white shadow-lg hover:shadow-xl
                disabled:text-gray-200 disabled:shadow-none
                transform hover:scale-105 disabled:hover:scale-100
                transition-all duration-200
              `}
            >
              {isCreating ? (
                <>
                  <FaSyncAlt className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
                  Creating...
                </>
              ) : bookingCreated ? (
                isOverrideMode ? (
                  "Go to Override Verification →"
                ) : (
                  "Go to Patient Consent →"
                )
              ) : (
                "Create Booking"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServiceRecommendation;
