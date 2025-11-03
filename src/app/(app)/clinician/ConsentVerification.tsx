"use client";
import { useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import OTPValidation from "@/components/OTPValidation";
import { useOtpValidation } from "@/features/patients/useValidateOtp";

interface ConsentVerificationProps {
  patient: {
    name: string;
    phone?: string;
  };
  booking: any;
  otpCode: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ConsentVerification({
  patient,
  booking,
  otpCode,
  onSuccess,
  onCancel,
}: ConsentVerificationProps) {
  const { validateOtpMutation, isValidating } = useOtpValidation();
  const [consentVerified, setConsentVerified] = useState(false);

  const handleValidateOTP = (otp: string) => {
    const bookingNumber =
      booking.booking_number || booking.id || booking.number;

    if (!bookingNumber) {
      toast.error("Booking ID is missing from booking data.");
      return;
    }

    const requestPayload = {
      otp_code: otp,
      booking_number: bookingNumber,
    };

    validateOtpMutation(requestPayload, {
      onSuccess: () => {
        toast.success("Patient consent verified successfully!");
        setConsentVerified(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      },
      onError: () => {
        toast.error("Invalid OTP. Please try again.");
      },
    });
  };

  if (consentVerified) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Consent Verified!
          </h3>
          <p className="text-gray-600">
            Patient consent has been successfully verified. Proceeding to next
            step...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl">
      <div className="mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Patient Consent Verification
        </h3>
        <p className="text-sm text-gray-600 text-center">
          An OTP has been sent to{" "}
          <span className="font-semibold">{patient.name}</span>
          {patient.phone && (
            <>
              {" "}
              at <span className="font-semibold">{patient.phone}</span>
            </>
          )}
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            i
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium mb-1">
              For Testing Purposes
            </p>
            <p className="text-xs text-blue-800">
              OTP Code: <span className="font-mono font-bold">{otpCode}</span>
            </p>
          </div>
        </div>
      </div>

      <OTPValidation
        title=""
        description=""
        onValidate={handleValidateOTP}
        onCancel={onCancel}
        processingLabel={isValidating ? "Verifying..." : "Verify Consent"}
        initialOtp=""
      />

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <FaTimesCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p>
            The patient must enter the OTP code they received to provide consent
            for this medical service booking.
          </p>
        </div>
      </div>
    </div>
  );
}
