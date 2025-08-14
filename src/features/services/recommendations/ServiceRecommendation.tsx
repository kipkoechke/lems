"use client";

import {
  goToNextStep,
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
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHospital,
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
  const facilityCode = workflow.selectedFacility?.code || "";

  console.log("ServiceRecommendation workflow state:", {
    patient: workflow.patient,
    paymentMode: workflow.selectedPaymentMode,
    facility: workflow.selectedFacility,
    facilityCode,
    fullWorkflow: workflow,
  });

  // Get services based on facility code - now returns FacilityContract[]
  const { contracts } = useServicesByFacilityCode(facilityCode);

  // Two-level selection state
  const [selectedContractId, setSelectedContractId] = useState<string>(""); // For diagnostic service (category)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]); // For multiple individual services
  const [serviceDates, setServiceDates] = useState<{
    [serviceId: string]: string;
  }>({}); // Individual dates for each service
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
    setSelectedServiceIds([]); // Reset service selection when contract changes
    setServiceDates({}); // Reset service dates
  };

  // Handle multiple service selection
  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const isSelected = prev.includes(serviceId);
      if (isSelected) {
        // Remove service and its date
        setServiceDates((prevDates) => {
          const newDates = { ...prevDates };
          delete newDates[serviceId];
          return newDates;
        });
        return prev.filter((id) => id !== serviceId);
      } else {
        // Add service
        return [...prev, serviceId];
      }
    });
  };

  // Handle date change for specific service
  const handleServiceDateChange = (serviceId: string, date: string) => {
    setServiceDates((prev) => ({
      ...prev,
      [serviceId]: date,
    }));
  };

  // Validate all fields for booking
  const validateAllFields = () => {
    const patient = patients?.find((p) => p.id === selectedPatientId);
    const facility = workflow.selectedFacility;

    // Find the selected services and contract
    const selectedServices = [];
    let selectedContract = null;

    if (selectedContractId) {
      selectedContract = contracts?.find((c) => c.id === selectedContractId);
      if (selectedContract) {
        for (const serviceId of selectedServiceIds) {
          const service = selectedContract.services.find(
            (s) => s.service_code === serviceId
          );
          if (service && serviceDates[serviceId]) {
            selectedServices.push({
              ...service,
              booking_date: serviceDates[serviceId],
            });
          }
        }
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
      selectedServices.length === 0 ||
      !selectedContract ||
      !facility ||
      !paymentMode
    ) {
      return null;
    }

    return {
      patient,
      services: selectedServices,
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
    const { patient, services, contract } = validatedFields;

    // Create a service object for the workflow state (use first service for legacy compatibility)
    const firstService = services[0];
    const serviceForWorkflow = {
      serviceId: firstService.service_code,
      serviceName: firstService.service_name,
      description: `${contract.lot_name} - ${firstService.service_name}`,
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
      patient_id: patient.id,
      payment_mode: selectedPaymentModeId, // Use the payment mode ID directly as string
      override: isOverrideMode, // Pass override flag based on current mode
      services: services.map((service: any) => ({
        service_id: service.service_id,
        booking_date: new Date(service.booking_date).toISOString(),
      })),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FaStethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Healthcare Service Booking
                </h1>
                <p className="text-sm text-gray-600">
                  Service Selection & Booking
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Step 2 of 4</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                ✓
              </div>
              <span className="text-green-600 font-medium">
                Patient Registered
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <span className="font-semibold text-blue-600">
                Service Selection
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <span className="hidden sm:inline">Consent Verification</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <span className="hidden sm:inline">Service Fulfillment</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full w-2/4 transition-all duration-500"></div>
          </div>
        </div>

        <form onSubmit={handleSubmitBooking} className="space-y-8">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaStethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Service Selection & Booking
                  </h2>
                  <p className="text-blue-100">
                    Choose your medical service and schedule your appointment
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Patient & Facility Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {workflow.patient && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {workflow.patient.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-green-800">
                          Patient: {workflow.patient.name}
                        </div>
                        <div className="text-sm text-green-700">
                          Phone: {workflow.patient.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {workflow.selectedFacility && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <FaHospital className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-purple-800">
                          Facility: {workflow.selectedFacility.name}
                        </div>
                        <div className="text-sm text-purple-700">
                          Code: {workflow.selectedFacility.code}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicators */}
              {bookingCreated && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500 rounded-full mr-3">
                      <FaCheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-green-800 font-bold text-lg">
                        Booking Created Successfully!
                      </span>
                      <p className="text-green-700 text-sm mt-1">
                        Booking ID:{" "}
                        <span className="font-mono bg-green-100 px-2 py-1 rounded text-xs">
                          {booking?.bookingId || "Generated"}
                        </span>
                        {isOverrideMode
                          ? " - Emergency override mode active"
                          : " - Ready for patient consent"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isOverrideMode && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-500 rounded-full mr-3">
                      <FaExclamationTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-amber-800 font-bold text-lg">
                        🚨 Emergency Override Mode
                      </span>
                      <p className="text-amber-700 text-sm mt-1">
                        This booking will bypass patient consent and require
                        manager approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Diagnostic Service Category */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaStethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Diagnostic Service
                      </h3>
                      <p className="text-sm text-gray-600">
                        Select a service category
                      </p>
                    </div>
                  </div>

                  <select
                    value={selectedContractId}
                    onChange={(e) => handleContractChange(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border-2 border-gray-200 hover:border-gray-300"
                    required
                    disabled={bookingCreated}
                  >
                    <option value="">Select a diagnostic service</option>
                    {contracts?.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        LOT {contract.lot_number} - {contract.lot_name}(
                        {
                          contract.services.filter((s) => s.is_active === "1")
                            .length
                        }{" "}
                        services)
                      </option>
                    ))}
                  </select>

                  {selectedContract && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="font-semibold text-blue-800 mb-2">
                        {selectedContract.lot_name}
                      </div>
                      <div className="text-sm text-blue-700">
                        {
                          selectedContract.services.filter(
                            (s) => s.is_active === "1"
                          ).length
                        }{" "}
                        available services
                      </div>
                    </div>
                  )}
                </div>

                {/* Individual Service */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaStethoscope className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Specific Services
                      </h3>
                      <p className="text-sm text-gray-600">
                        Select multiple services as needed
                      </p>
                    </div>
                  </div>

                  {!selectedContractId ? (
                    <div className="p-4 bg-gray-100 rounded-xl text-gray-500 text-center">
                      First select a diagnostic service category
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableServices.map((service) => (
                        <div
                          key={service.service_code}
                          className={`border-2 rounded-xl p-4 transition-all ${
                            selectedServiceIds.includes(service.service_code)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedServiceIds.includes(
                                  service.service_code
                                )}
                                onChange={() =>
                                  handleServiceToggle(service.service_code)
                                }
                                className="w-4 h-4 text-green-600 rounded"
                                disabled={bookingCreated}
                              />
                              <span className="font-medium text-gray-900">
                                {service.service_name}
                              </span>
                            </label>
                            <span className="text-sm text-gray-500">
                              {service.service_code}
                            </span>
                          </div>

                          {selectedServiceIds.includes(
                            service.service_code
                          ) && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Appointment Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={serviceDates[service.service_code] || ""}
                                onChange={(e) =>
                                  handleServiceDateChange(
                                    service.service_code,
                                    e.target.value
                                  )
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                min={new Date().toISOString().slice(0, 16)}
                                disabled={bookingCreated}
                                required
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedServiceIds.length > 0 && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="font-semibold text-green-800 mb-1">
                        {selectedServiceIds.length} service(s) selected
                      </div>
                      <div className="text-sm text-green-700">
                        {selectedServiceIds
                          .map(
                            (id) =>
                              availableServices.find(
                                (s) => s.service_code === id
                              )?.service_name
                          )
                          .join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Date */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Appointment Date & Time
                      </h3>
                      <p className="text-sm text-gray-600">
                        Schedule your service
                      </p>
                    </div>
                  </div>

                  <input
                    type="hidden"
                    className="w-full p-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all border-2 border-gray-200 hover:border-gray-300"
                  />
                </div>

                {/* Emergency Override Toggle */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FaExclamationTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Emergency Options
                      </h3>
                      <p className="text-sm text-gray-600">
                        For urgent medical situations
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="font-semibold text-amber-800">
                          Emergency Override
                        </div>
                        <div className="text-sm text-amber-700">
                          Bypass patient consent for urgent cases
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (bookingCreated) {
                            toast.error(
                              "Cannot change override mode after booking is created"
                            );
                            return;
                          }
                          setIsOverrideMode(!isOverrideMode);
                        }}
                        disabled={bookingCreated}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                          bookingCreated ? "opacity-50 cursor-not-allowed" : ""
                        } ${isOverrideMode ? "bg-amber-500" : "bg-gray-300"}`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                            isOverrideMode ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={
                isCreating ||
                selectedServiceIds.length === 0 ||
                !Object.keys(serviceDates).every((id) => serviceDates[id])
              }
              className={`inline-flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl ${
                !isCreating &&
                selectedServiceIds.length > 0 &&
                Object.keys(serviceDates).every((id) => serviceDates[id])
                  ? bookingCreated
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transform hover:scale-105"
                    : isOverrideMode
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 transform hover:scale-105"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Booking...
                </>
              ) : bookingCreated ? (
                <>
                  <FaCheckCircle className="w-5 h-5" />
                  Continue to Consent Verification
                  <FaArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  {isOverrideMode ? (
                    <>
                      <FaExclamationTriangle className="w-5 h-5" />
                      Create Emergency Booking
                    </>
                  ) : (
                    <>
                      <FaStethoscope className="w-5 h-5" />
                      Create Booking
                    </>
                  )}
                  <FaArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRecommendation;
