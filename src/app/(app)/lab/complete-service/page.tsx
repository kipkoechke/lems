"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaClock,
  FaRedo,
  FaFlask,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { Bookings } from "@/services/apiBooking";
import { useServiceCompletionOtp } from "@/features/services/bookings/useServiceCompletionOtp";
import { useValidateServiceCompletionOtp } from "@/features/services/bookings/useValidateServiceCompletionOtp";

export default function ServiceCompletionPage() {
  const router = useRouter();
  const { requestOtp, isRequesting } = useServiceCompletionOtp();
  const { validateOtp, isValidating } = useValidateServiceCompletionOtp();

  const [bookingInfo, setBookingInfo] = useState<Bookings | null>(null);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [completedServices, setCompletedServices] = useState<string[]>([]);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [allServicesCompleted, setAllServicesCompleted] = useState(false);

  useEffect(() => {
    // Load booking info from sessionStorage
    const stored = sessionStorage.getItem("serviceCompletionBooking");
    if (!stored) {
      toast.error("No booking found");
      router.push("/lab");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setBookingInfo(parsed);

      // Auto-request OTP for first service
      if (parsed.id && parsed.services?.[0]?.id) {
        handleRequestOtp(parsed.id, parsed.services[0].id);
      }
    } catch {
      toast.error("Invalid booking data");
      router.push("/lab");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const currentService = bookingInfo?.services?.[currentServiceIndex];
  const totalServices = bookingInfo?.services?.length || 0;

  const handleRequestOtp = (bookingId: string, serviceId?: string) => {
    const payload = {
      booking_id: bookingId,
      service_id: serviceId || currentService?.id || "",
    };
    requestOtp(payload, {
      onSuccess: (response: any) => {
        toast.success(
          response.message || "OTP sent to patient successfully"
        );

        if (response.data?.expires_at) {
          const expiryTime = new Date(response.data.expires_at).getTime();
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
          setTimeRemaining(remaining);
        }

        // Store session_id for verification
        if (response.data?.session_id) {
          sessionStorage.setItem("serviceCompletionSession", response.data.session_id);
        }
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.message ||
            "Failed to send OTP. Please try again."
        );
      },
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 5) {
      toast.error("Please enter complete OTP");
      return;
    }

    if (!bookingInfo?.id || !currentService) {
      toast.error("Booking or service information missing");
      return;
    }

    // Get session_id from storage (set during OTP request)
    const sessionId = sessionStorage.getItem("serviceCompletionSession");
    
    const requestPayload = {
      session_id: sessionId || bookingInfo.id,
      otp: otpCode,
    };

    validateOtp(requestPayload, {
      onSuccess: () => {
        const newCompletedServices = [...completedServices, currentService.id];
        setCompletedServices(newCompletedServices);

        // Clear OTP inputs and session
        setOtp(["", "", "", "", ""]);
        sessionStorage.removeItem("serviceCompletionSession");

        // Check if all services are completed
        if (newCompletedServices.length === totalServices) {
          toast.success("All services completed successfully!");
          setAllServicesCompleted(true);

          // Redirect after 2 seconds
          setTimeout(() => {
            sessionStorage.removeItem("serviceCompletionBooking");
            router.push("/lab");
          }, 2000);
        } else {
          // Move to next service
          const nextIndex = currentServiceIndex + 1;
          setCurrentServiceIndex(nextIndex);
          toast.success(
            `Service ${currentServiceIndex + 1}/${totalServices} completed!`
          );

          // Auto-request OTP for next service
          setTimeout(() => {
            handleRequestOtp(bookingInfo.booking_number);
          }, 1000);
        }
      },
      onError: () => {
        toast.error("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      },
    });
  };

  const handleResendOtp = () => {
    if (!bookingInfo?.booking_number) {
      toast.error("Booking information missing");
      return;
    }

    setOtp(["", "", "", "", ""]);
    handleRequestOtp(bookingInfo.booking_number);
  };

  const handleCancel = () => {
    sessionStorage.removeItem("serviceCompletionBooking");
    router.push("/lab");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!bookingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (allServicesCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Service Completion Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            All services have been completed successfully
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Booking:</span>{" "}
              {bookingInfo.booking_number}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Patient:</span>{" "}
              {bookingInfo.patient?.name}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Services Completed:</span>{" "}
              {totalServices}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to lab services...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Bookings</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <FaFlask className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Service Completion</h1>
              <p className="text-white/90 text-sm">
                Complete service {currentServiceIndex + 1} of {totalServices}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{
                width: `${((currentServiceIndex + 1) / totalServices) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Booking Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaUser className="w-4 h-4 text-gray-600" />
              Booking Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Booking Number:</span>
                <p className="font-medium text-gray-900">
                  {bookingInfo.booking_number}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Patient:</span>
                <p className="font-medium text-gray-900">
                  {bookingInfo.patient?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Current Service */}
          {currentService && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border-2 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaFlask className="w-4 h-4 text-blue-600" />
                Current Service
              </h3>
              <div className="text-sm space-y-2">
                <p className="font-medium text-gray-900">
                  {currentService.service?.name || "Service"}
                </p>
                <p className="text-gray-600">
                  Code: {currentService.service?.code || "N/A"}
                </p>
                <p className="text-gray-600">
                  Scheduled:{" "}
                  {currentService.scheduled_date || currentService.booking_date
                    ? new Date(
                        (currentService.scheduled_date || currentService.booking_date)!
                      ).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* OTP Verification Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Verify Service Completion
                </h3>
                <p className="text-sm text-gray-600">
                  Enter the OTP sent to patient&apos;s phone
                </p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  disabled={isValidating}
                />
              ))}
            </div>

            {/* Timer */}
            {timeRemaining !== null && timeRemaining > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                <FaClock className="w-4 h-4" />
                <span>OTP expires in {formatTime(timeRemaining)}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={
                  otp.join("").length !== 5 || isValidating || isRequesting
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isValidating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Verify & Complete</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResendOtp}
                disabled={isRequesting || isValidating}
                className="px-6 bg-white border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequesting ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaRedo className="w-4 h-4" />
                    <span>Resend</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Completed Services */}
          {completedServices.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <FaCheckCircle className="w-4 h-4" />
                Completed Services ({completedServices.length}/{totalServices})
              </h4>
              <div className="space-y-1">
                {bookingInfo.services
                  ?.filter((s) => completedServices.includes(s.id))
                  .map((service) => (
                    <div
                      key={service.id}
                      className="text-sm text-green-800 flex items-center gap-2"
                    >
                      <FaCheckCircle className="w-3 h-3" />
                      <span>{service.service?.name || "Service"}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
