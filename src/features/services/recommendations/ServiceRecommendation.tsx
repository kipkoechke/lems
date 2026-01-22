"use client";

import {
  goToNextStep,
  goToPreviousStep,
  selectService,
  setBooking,
  setBookingServices,
  setSelectedContract,
  setSelectedServices,
  setServiceDate,
  setOverrideMode,
} from "@/context/workflowSlice";
import BackButton from "@/components/common/BackButton";
import { usePatients } from "@/features/patients/usePatients";
import { useCreateBooking } from "@/features/services/bookings/useCreateBooking";
import { useServicesByFacilityId } from "@/features/services/useServicesByFacilityCode";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHospital,
} from "react-icons/fa";
import { FaStethoscope } from "react-icons/fa6";
import { maskPhoneNumber } from "@/lib/maskUtils";
import type { FlattenedContractService } from "@/types/contract";

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
  const facilityId = workflow.selectedFacility?.id || "";

  // Get service selection state from Redux
  const selectedContractId = workflow.selectedContractId || "";
  const selectedServiceIds = workflow.selectedServiceIds || [];
  const serviceDates = workflow.serviceDates || {};
  const isOverrideMode = workflow.isOverrideMode || false;

  console.log("ServiceRecommendation workflow state:", {
    patient: workflow.patient,
    paymentMode: workflow.selectedPaymentMode,
    facility: workflow.selectedFacility,
    facilityId,
    fullWorkflow: workflow,
  });

  // Get services based on facility ID - now returns FacilityContract[]
  const { contracts, flattenedServices, isServicesLoading } =
    useServicesByFacilityId(facilityId);

  // Initialize contract selection if not set and contracts are available
  useEffect(() => {
    if (!selectedContractId && contracts && contracts.length > 0) {
      dispatch(setSelectedContract(contracts[0].id));
    }
  }, [selectedContractId, contracts, dispatch]);

  // Booking state - check if booking already exists to preserve UI state
  const [bookingCreated, setBookingCreated] = useState<boolean>(
    !!workflow.booking,
  );
  const booking = useAppSelector((store) => store.workflow.booking);

  // Get the selected contract (diagnostic service category)
  const selectedContract = contracts?.find((c) => c.id === selectedContractId);

  console.log("🎯 Selected contract:", selectedContract);
  console.log("📋 Contracts array:", contracts);
  console.log("🔍 Selected contract services:", selectedContract?.services);

  // Get available services for the selected contract (flattened)
  const availableServices: FlattenedContractService[] = selectedContract
    ? flattenedServices.filter(
        (s) => s.contract_id === selectedContractId && s.is_active
      )
    : [];

  console.log("✅ Available services (filtered):", availableServices);
  console.log("📊 Available services count:", availableServices.length);

  // Handle contract selection (diagnostic service category)
  const handleContractChange = (contractId: string) => {
    dispatch(setSelectedContract(contractId));
    dispatch(setSelectedServices([])); // Reset service selection when contract changes
    // Reset service dates - we'll need to clear all dates
    selectedServiceIds.forEach((serviceId) => {
      dispatch(setServiceDate({ serviceId, date: "" }));
    });
  };

  // Handle multiple service selection
  const handleServiceToggle = (serviceId: string) => {
    const isSelected = selectedServiceIds.includes(serviceId);
    if (isSelected) {
      // Remove service and its date
      dispatch(
        setSelectedServices(
          selectedServiceIds.filter((id) => id !== serviceId),
        ),
      );
      dispatch(setServiceDate({ serviceId, date: "" }));
    } else {
      // Add service
      dispatch(setSelectedServices([...selectedServiceIds, serviceId]));
    }
  };

  // Handle date change for specific service
  const handleServiceDateChange = (serviceId: string, date: string) => {
    dispatch(setServiceDate({ serviceId, date }));
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
          const service = availableServices.find(
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
        console.log("Booking creation response:", response);
        toast.success("Booking created successfully!");

        // Store session_id for OTP verification
        if (typeof window !== 'undefined' && response.data?.session_id) {
          sessionStorage.setItem('booking_session_id', response.data.session_id);
        }

        // Store booking info in redux (partial info from initiate response)
        const bookingInfo = {
          id: '', // Will be set after OTP verification
          booking_number: '', // Will be set after OTP verification
          session_id: response.data?.session_id,
          patient: response.data?.patient,
          facility: response.data?.facility,
          services_count: response.data?.services_count,
          expires_at: response.data?.expires_at,
          otp_message: response.message,
        };
        dispatch(setBooking(bookingInfo as any));

        // New flow: OTP is sent to patient's phone
        if (response.data?.expires_at) {
          // Show OTP sent message
          toast.success(response.message || "OTP sent to patient's phone");

          // Go to consent step for OTP validation
          dispatch(goToNextStep());
        } else {
          console.error("No expiry time in response:", response);
          toast.error(
            "Booking created but OTP not sent. Please contact support.",
          );
        }
      },
      onError: (error: any) => {
        console.error("Booking creation error:", error);
        toast.error(
          error?.response?.data?.message || "Failed to create booking",
        );
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
                  Service Selection & Booking
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Step 2 of 4</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto  py-2">
        <form onSubmit={handleSubmitBooking} className="space-y-4">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6">
              {/* Patient & Facility Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {workflow.patient && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {workflow.patient.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-green-800 text-sm">
                          Patient: {workflow.patient.name}
                        </div>
                        <div className="text-xs text-green-700">
                          Phone: {maskPhoneNumber(workflow.patient.phone)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {workflow.selectedFacility && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <FaHospital className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-purple-800 text-sm">
                          Facility: {workflow.selectedFacility.name}
                        </div>
                        <div className="text-xs text-purple-700">
                          Code: {workflow.selectedFacility.code}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicators */}
              {bookingCreated && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500 rounded-full mr-3">
                      <FaCheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-green-800 font-bold text-base">
                        Booking Created Successfully!
                      </span>
                      <p className="text-green-700 text-xs mt-1">
                        Booking ID:{" "}
                        <span className="font-mono bg-green-100 px-2 py-1 rounded text-xs">
                          {booking?.id}
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
                <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-500 rounded-full mr-3">
                      <FaExclamationTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-amber-800 font-bold text-base">
                        🚨 Emergency Override Mode
                      </span>
                      <p className="text-amber-700 text-xs mt-1">
                        This booking will bypass patient consent and require
                        manager approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Diagnostic Service Category */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaStethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Diagnostic Service
                      </h3>
                      <p className="text-xs text-gray-600">
                        Select a service category
                      </p>
                    </div>
                  </div>

                  <select
                    value={selectedContractId}
                    onChange={(e) => handleContractChange(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border-2 border-gray-200 hover:border-gray-300 text-sm"
                    required
                    disabled={bookingCreated || isServicesLoading}
                  >
                    <option value="">
                      {isServicesLoading
                        ? "Loading diagnostic services..."
                        : contracts.length === 0
                          ? "No diagnostic services available"
                          : "Select a diagnostic service"}
                    </option>
                    {contracts?.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        LOT {contract.lot_number} - {contract.lot_name} (
                        {contract.services?.filter((s) => s.is_active === true)
                          .length || 0}{" "}
                        services)
                      </option>
                    ))}
                  </select>

                  {selectedContract && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
                      <div className="font-semibold text-blue-800 mb-1 text-sm">
                        {selectedContract.lot_name}
                      </div>
                      <div className="text-xs text-blue-700">
                        {selectedContract.services?.filter(
                          (s) => s.is_active === true,
                        ).length || 0}{" "}
                        available services
                      </div>
                    </div>
                  )}
                </div>

                {/* Individual Service */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <FaStethoscope className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Specific Services
                      </h3>
                      <p className="text-xs text-gray-600">
                        Select multiple services as needed
                      </p>
                    </div>
                  </div>

                  {!selectedContractId ? (
                    <div className="p-3 bg-gray-100 rounded-xl text-gray-500 text-center text-sm">
                      First select a diagnostic service category
                    </div>
                  ) : availableServices.length === 0 ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-center text-sm">
                      No services available for this diagnostic category
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableServices.map((service) => (
                        <div
                          key={service.service_code}
                          className={`border-2 rounded-xl p-3 transition-all ${
                            selectedServiceIds.includes(service.service_code)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`service-${service.service_code}`}
                                checked={selectedServiceIds.includes(
                                  service.service_code,
                                )}
                                onChange={() =>
                                  handleServiceToggle(service.service_code)
                                }
                                className="w-4 h-4 text-green-600 rounded cursor-pointer"
                                disabled={bookingCreated}
                              />
                              <label
                                htmlFor={`service-${service.service_code}`}
                                className="font-medium text-gray-900 text-sm cursor-pointer"
                              >
                                {service.service_name}
                              </label>
                            </div>
                            <span className="text-xs text-gray-500">
                              {service.service_code}
                            </span>
                          </div>

                          {selectedServiceIds.includes(
                            service.service_code,
                          ) && (
                            <div className="mt-2 pt-2 border-t border-green-200">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Appointment Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={serviceDates[service.service_code] || ""}
                                onChange={(e) =>
                                  handleServiceDateChange(
                                    service.service_code,
                                    e.target.value,
                                  )
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                                (s) => s.service_code === id,
                              )?.service_name,
                          )
                          .join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Override Toggle */}
              <div className="mt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FaExclamationTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Emergency Options
                      </h3>
                      <p className="text-xs text-gray-600">
                        For urgent medical situations
                      </p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="font-semibold text-amber-800 text-sm">
                          Emergency Override
                        </div>
                        <div className="text-xs text-amber-700">
                          Bypass patient consent for urgent cases
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (bookingCreated) {
                            toast.error(
                              "Cannot change override mode after booking is created",
                            );
                            return;
                          }
                          dispatch(setOverrideMode(!isOverrideMode));
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
          <div className="flex justify-between items-center mt-6">
            <BackButton onClick={() => dispatch(goToPreviousStep())} />
            <button
              type="submit"
              disabled={
                isCreating ||
                selectedServiceIds.length === 0 ||
                !Object.keys(serviceDates).every((id) => serviceDates[id])
              }
              className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl ${
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
