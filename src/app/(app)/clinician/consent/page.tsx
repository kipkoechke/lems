"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useOtpValidation } from "@/features/patients/useValidateOtp";
import { maskPhoneNumber } from "@/lib/maskUtils";

export default function ConsentVerificationPage() {
  const router = useRouter();
  const { validateOtpMutation, isValidating } = useOtpValidation();

  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [consentVerified, setConsentVerified] = useState(false);

  useEffect(() => {
    // Load booking info from sessionStorage
    const stored = sessionStorage.getItem("pendingBooking");
    if (!stored) {
      toast.error("No pending booking found");
      router.push("/clinician");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setBookingInfo(parsed);
    } catch {
      toast.error("Invalid booking data");
      router.push("/clinician");
    }
  }, [router]);

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

  const handleVerify = () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 5) {
      toast.error("Please enter complete OTP");
      return;
    }

    if (!bookingInfo?.booking_number) {
      toast.error("Booking information missing");
      return;
    }

    const requestPayload = {
      otp_code: otpCode,
      booking_number: bookingInfo.booking_number,
    };

    validateOtpMutation(requestPayload, {
      onSuccess: () => {
        toast.success("Patient consent verified successfully!");
        setConsentVerified(true);

        // Clear session storage
        sessionStorage.removeItem("pendingBooking");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/clinician");
        }, 2000);
      },
      onError: () => {
        toast.error("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      },
    });
  };

  const handleCancel = () => {
    sessionStorage.removeItem("pendingBooking");
    router.push("/clinician");
  };

  if (!bookingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (consentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Consent Verified!
          </h2>
          <p className="text-gray-600 mb-6">
            Patient consent has been successfully verified. Redirecting you
            back...
          </p>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2">
          <div className="flex items-center justify-between mb-1">
            <button
              onClick={handleCancel}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <FaArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <FaShieldAlt className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-bold text-white">
                Patient Consent Verification
              </h1>
            </div>
            <div className="w-6"></div>
          </div>
          <p className="text-blue-100 text-center">
            Booking #{bookingInfo.booking_number}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Patient Info */}
          {/* <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">
              Patient Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold text-gray-900">
                  {bookingInfo.patient_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold text-gray-900">
                  {maskPhoneNumber(bookingInfo.patient_phone)}
                </span>
              </div>
            </div>
          </div> */}

          {/* OTP Message */}
          {bookingInfo.otp_message && (
            <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  ✓
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    OTP Sent Successfully
                  </p>
                  <p className="text-xs text-green-800">
                    {bookingInfo.otp_message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-8">
            <label className="block text-center text-gray-700 font-semibold mb-4 text-lg">
              Enter 5-Digit OTP Code
            </label>
            <div className="flex gap-3 justify-center mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  disabled={isValidating}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              The OTP was sent to the registered phone number
            </p>
          </div>

          {/* Expiry Info */}
          {bookingInfo.expires_at && (
            <p className="text-xs text-gray-500 text-center mb-6">
              OTP expires at:{" "}
              {new Date(bookingInfo.expires_at).toLocaleString()}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              disabled={isValidating}
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={isValidating || otp.join("").length !== 5}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isValidating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <FaShieldAlt className="w-5 h-5" />
                  <span>Verify Consent</span>
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-blue-600 font-bold">ℹ</span>
              <p>
                The patient must enter the OTP code they received to provide
                consent for this medical service booking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
