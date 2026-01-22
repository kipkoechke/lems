"use client";

import {
  completeService,
  goToPreviousStep,
  resetWorkflow,
  setBooking,
} from "@/context/workflowSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClipboardCheck,
  FaClock,
  FaExclamationTriangle,
  FaHome,
  FaRedo,
  FaShieldAlt,
  FaSpinner,
  FaStethoscope,
  FaTrophy,
  FaUser,
} from "react-icons/fa";
import OTPValidation from "../../../components/OTPValidation";
import { useFulfillmentOtp } from "./useFulfillmentOtp";
import { useValidateServiceFulfillmentOtp } from "./useValidateServiceFulfillmentOtp";

const ServiceFulfillment: React.FC = () => {
  const { patient, selectedService, consentObtained } = useAppSelector(
    (store) => store.workflow
  );
  const { booking } = useAppSelector((store) => store.workflow);
  const bookingNumber = booking?.booking_number;

  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const { isRequesting, requestFulfillmentOtp } = useFulfillmentOtp();
  const { validateOtpMutation, isValidating } =
    useValidateServiceFulfillmentOtp();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showOTP, setShowOTP] = useState(false);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<
    "pending" | "completed" | "failed"
  >("pending");
  const [otpSent, setOtpSent] = useState(false);

  // New state for handling multiple services
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [completedServices, setCompletedServices] = useState<string[]>([]);
  const [servicesStatus, setServicesStatus] = useState<{
    [key: string]: "pending" | "completed" | "failed";
  }>({});

  // Get services array from booking
  const services = booking?.services || [];
  const currentService = services[currentServiceIndex];
  const totalServices = services.length;
  const allServicesCompleted = completedServices.length === totalServices;

  // Send fulfillment OTP via API for current service
  const handleSendOTP = () => {
    console.log("=== REQUESTING SERVICE FULFILLMENT OTP ===");
    console.log("Booking number:", bookingNumber);
    console.log("Current service index:", currentServiceIndex);
    console.log("Current service:", currentService);

    if (!bookingNumber) {
      console.error("No booking number available for OTP request");
      setFulfillmentStatus("failed");
      return;
    }

    if (!currentService) {
      console.error("No current service available for OTP request");
      setFulfillmentStatus("failed");
      return;
    }

    setOtpSent(true);
    requestFulfillmentOtp(
      { booking_id: booking?.id || bookingNumber, service_id: currentService.id },
      {
        onSuccess: (data) => {
          console.log("=== OTP REQUEST SUCCESS ===");
          console.log("Response data:", data);

          // Store session_id for OTP verification
          if (typeof window !== 'undefined' && data?.data?.session_id) {
            sessionStorage.setItem('service_completion_session_id', data.data.session_id);
          }

          toast.success(
            `Service ${currentServiceIndex + 1}/${totalServices} - OTP sent to patient's phone`
          );
          setTimeout(() => {
            setShowOTP(true);
          }, 500);
        },
      onError: (error) => {
        console.error("=== OTP REQUEST ERROR ===");
        console.error("Error:", error);
        setOtpSent(false);
        setFulfillmentStatus("failed");
      },
    });
  };

  useEffect(() => {
    handleSendOTP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validate OTP via API for current service
  const handleValidateOTP = (otp: string) => {
    console.log("=== VALIDATING SERVICE FULFILLMENT OTP ===");
    console.log("Booking number:", bookingNumber);
    console.log("Current service index:", currentServiceIndex);
    console.log("Current service:", currentService);
    console.log("OTP code:", otp);

    if (!bookingNumber) {
      console.error("No booking number available for OTP validation");
      setFulfillmentStatus("failed");
      return;
    }

    if (!currentService) {
      console.error("No current service available for OTP validation");
      setFulfillmentStatus("failed");
      return;
    }

    const serviceId = currentService.id;

    console.log("=== VALIDATING SERVICE FULFILLMENT OTP ===");
    console.log("Booking ID:", booking?.id || bookingNumber);
    console.log("Service ID:", serviceId);
    console.log("OTP code:", otp);

    // Get session_id from sessionStorage
    const sessionId = typeof window !== 'undefined' 
      ? sessionStorage.getItem('service_completion_session_id') 
      : null;

    if (!sessionId) {
      toast.error("Session expired. Please request a new OTP.");
      return;
    }

    validateOtpMutation(
      {
        data: {
          session_id: sessionId,
          otp: otp,
        },
      },
      {
        onSuccess: () => {
          // Clear session_id after successful verification
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('service_completion_session_id');
          }

          // Mark current service as completed
          const updatedCompletedServices = [...completedServices, serviceId];
          setCompletedServices(updatedCompletedServices);

          // Update service status
          setServicesStatus((prev) => ({
            ...prev,
            [serviceId]: "completed",
          }));

          // Update booking in redux (mark current service as completed)
          const updatedServices =
            booking?.services?.map((service) =>
              service.id === serviceId
                ? { ...service, service_status: "completed" as const }
                : service
            ) || [];

          if (booking) {
            dispatch(setBooking({ ...booking, services: updatedServices }));
          }

          setShowOTP(false);
          setOtpSent(false);
          setGeneratedOtp(null);

          // Check if all services are completed
          if (updatedCompletedServices.length === totalServices) {
            // All services completed
            setFulfillmentStatus("completed");
            dispatch(completeService(true));
            toast.success("All services completed successfully!");
          } else {
            // Move to next service
            const nextIndex = currentServiceIndex + 1;
            setCurrentServiceIndex(nextIndex);
            toast.success(
              `Service ${
                currentServiceIndex + 1
              }/${totalServices} completed! Moving to next service...`
            );

            // Auto-request OTP for next service after a short delay
            setTimeout(() => {
              handleSendOTP();
            }, 1500);
          }
        },
        onError: (error) => {
          console.error("=== OTP VALIDATION ERROR ===");
          console.error("Error:", error);
          setServicesStatus((prev) => ({
            ...prev,
            [serviceId]: "failed",
          }));
          setFulfillmentStatus("failed");
        },
      }
    );
  };

  const handleCancelFulfillment = () => {
    setFulfillmentStatus("failed");
    dispatch(completeService(false));
  };

  const handleRetry = () => {
    setShowOTP(false);
    setOtpSent(false);
    setFulfillmentStatus("pending");

    // Reset status for current service
    if (currentService) {
      setServicesStatus((prev) => ({
        ...prev,
        [currentService.id]: "pending",
      }));
    }

    handleSendOTP();
  };

  // Reset workflow and redirect after completion
  useEffect(() => {
    if (fulfillmentStatus === "completed") {
      const timer = setTimeout(() => {
        dispatch(resetWorkflow());
        router.push("/bookings");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [fulfillmentStatus, dispatch, router]);

  if (
    !patient ||
    !selectedService ||
    !consentObtained ||
    !booking?.services?.length
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Prerequisites Missing
            </h1>
            <p className="text-gray-600">
              {!patient && "Patient information is missing. "}
              {!selectedService && "Service information is missing. "}
              {!consentObtained && "Patient consent is missing. "}
              {!booking?.services?.length && "No services found in booking. "}
            </p>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="text-center">
              <FaExclamationTriangle className="mx-auto text-red-500 text-6xl mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cannot Proceed
              </h3>
              <p className="text-gray-600 mb-6">
                Please complete the previous steps first.
              </p>

              <button
                onClick={() => dispatch(goToPreviousStep())}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <FaStethoscope className="text-white text-2xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Service Fulfillment
          </h1>
          <p className="text-gray-600">Complete the diagnostic service</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* Step 1 - Registration */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-sm" />
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  Registration
                </span>
              </div>

              <div className="w-8 h-0.5 bg-green-500"></div>

              {/* Step 2 - Service Selection */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-sm" />
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  Service Selection
                </span>
              </div>

              <div className="w-8 h-0.5 bg-green-500"></div>

              {/* Step 3 - Consent */}
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-sm" />
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  Consent
                </span>
              </div>

              <div className="w-8 h-0.5 bg-blue-500"></div>

              {/* Step 4 - Fulfillment */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    fulfillmentStatus === "completed"
                      ? "bg-green-500"
                      : fulfillmentStatus === "failed"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                >
                  {fulfillmentStatus === "completed" ? (
                    <FaCheckCircle className="text-white text-sm" />
                  ) : fulfillmentStatus === "failed" ? (
                    <FaExclamationTriangle className="text-white text-sm" />
                  ) : (
                    <FaStethoscope className="text-white text-sm" />
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    fulfillmentStatus === "completed"
                      ? "text-green-600"
                      : fulfillmentStatus === "failed"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  Fulfillment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Fulfillment Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium text-gray-900">{patient.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaStethoscope className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Services Progress</p>
                <p className="font-medium text-gray-900">
                  {completedServices.length} of {totalServices} completed
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overall Status</p>
                <p className="font-medium text-gray-900">
                  {allServicesCompleted
                    ? "All Completed"
                    : fulfillmentStatus === "failed"
                    ? "Failed"
                    : "In Progress"}
                </p>
              </div>
            </div>
          </div>

          {/* Services List */}
          {totalServices > 1 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Services in this booking:
              </h4>
              <div className="space-y-2">
                {services.map((service, index) => {
                  const isCompleted = completedServices.includes(service.id);
                  const isCurrent = index === currentServiceIndex;
                  const isFailed = servicesStatus[service.id] === "failed";

                  return (
                    <div
                      key={service.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCompleted
                          ? "bg-green-50 border-green-200"
                          : isFailed
                          ? "bg-red-50 border-red-200"
                          : isCurrent
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isFailed
                              ? "bg-red-500 text-white"
                              : isCurrent
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {isCompleted ? (
                            <FaCheckCircle className="text-xs" />
                          ) : isFailed ? (
                            <FaExclamationTriangle className="text-xs" />
                          ) : isCurrent ? (
                            <FaSpinner className="text-xs animate-spin" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Service {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            Booking Date:{" "}
                            {service.booking_date || service.scheduled_date
                              ? new Date(
                                  (service.booking_date || service.scheduled_date)!
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-medium ${
                            isCompleted
                              ? "text-green-600"
                              : isFailed
                              ? "text-red-600"
                              : isCurrent
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : isFailed
                            ? "Failed"
                            : isCurrent
                            ? "In Progress"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        {fulfillmentStatus === "completed" ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTrophy className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                All Services Completed Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                All {totalServices} diagnostic service
                {totalServices > 1 ? "s" : ""} in this booking ha
                {totalServices > 1 ? "ve" : "s"} been successfully fulfilled.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <FaClipboardCheck />
                  <span className="font-medium">
                    Results will be available shortly
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    dispatch(resetWorkflow());
                    router.push("/bookings");
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaHome className="mr-2" />
                  View All Bookings
                </button>
                <button
                  onClick={() => {
                    dispatch(resetWorkflow());
                    router.push("/patients");
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaUser className="mr-2" />
                  New Patient
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                Redirecting to bookings in 10 seconds...
              </div>
            </div>
          </div>
        ) : fulfillmentStatus === "failed" ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaExclamationTriangle className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Fulfillment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                Service fulfillment was not successful or OTP verification
                failed.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-red-700">
                  <FaExclamationTriangle />
                  <span className="font-medium">
                    Please retry or contact the service department
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaRedo className="mr-2" />
                  Retry Fulfillment
                </button>
                <button
                  onClick={() => dispatch(goToPreviousStep())}
                  className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaArrowLeft className="mr-2" />
                  Go Back
                </button>
              </div>
            </div>
          </div>
        ) : showOTP ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verify Service Completion
              </h3>
              <p className="text-gray-600">
                Enter the OTP to confirm completion of service{" "}
                <strong>
                  {currentServiceIndex + 1} of {totalServices}
                </strong>
                {totalServices > 1 && (
                  <span className="block text-sm mt-1">
                    ({completedServices.length} already completed)
                  </span>
                )}
              </p>
            </div>

            <OTPValidation
              title=""
              description=""
              onValidate={handleValidateOTP}
              onCancel={handleCancelFulfillment}
              processingLabel={
                isValidating ? "Confirming..." : "Confirm Fulfillment"
              }
              initialOtp={generatedOtp ?? ""}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {isRequesting || otpSent ? (
                  <FaSpinner className="text-blue-600 text-3xl animate-spin" />
                ) : (
                  <FaClock className="text-blue-600 text-3xl" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {isRequesting || otpSent
                  ? `Sending Verification Code - Service ${
                      currentServiceIndex + 1
                    }/${totalServices}`
                  : `Preparing Service ${
                      currentServiceIndex + 1
                    }/${totalServices}`}
              </h3>
              <p className="text-gray-600 mb-6">
                {isRequesting || otpSent
                  ? `We're sending an OTP for service ${
                      currentServiceIndex + 1
                    } verification...`
                  : `Please wait while we prepare the service fulfillment process...`}
                {completedServices.length > 0 && (
                  <span className="block text-sm mt-2 text-green-600">
                    ✓ {completedServices.length} service
                    {completedServices.length > 1 ? "s" : ""} already completed
                  </span>
                )}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <FaSpinner className="animate-spin" />
                  <span className="font-medium">Processing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceFulfillment;
