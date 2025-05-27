"use client";

import { goToPreviousStep } from "@/context/workflowSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useState } from "react";
import toast from "react-hot-toast";
import OTPValidation from "../../components/OTPValidation";
import StatusCard from "../../components/StatusCard";
import { usePatientConsentOverride } from "./useConsentOverride";
import { usePatientConsent } from "./usePatientConsent";
import { useOtpValidation } from "./useValidateOtp";
import { useOtpValidationOverride } from "./useValidateOverride";

const PatientConsent: React.FC = () => {
  const { patient, selectedService, booking } = useAppSelector(
    (store) => store.workflow
  );
  const dispatch = useAppDispatch();
  const { requestPatientConsentOtp, isRegistering } = usePatientConsent();
  const { requestConsentOtpOverride, isRegistering: isOverrideRegistering } =
    usePatientConsentOverride();
  const { validateConsentOverrideOtp, isValidating: isOverrideValidating } =
    useOtpValidationOverride();
  const [showOTP, setShowOTP] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [generatedOverrideOtp, setGeneratedOverrideOtp] = useState<
    string | null
  >(null);

  const [showOverrideOTP, setShowOverrideOTP] = useState(false);

  const { validateOtpMutation, isValidating } = useOtpValidation();

  const [consentStatus, setConsentStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [otpSent, setOtpSent] = useState(false);

  const handlePreviousStep = () => {
    dispatch(goToPreviousStep());
  };

  if (!patient || !selectedService) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusCard
          title="Information Missing"
          status="error"
          message="Patient or service information is missing."
          details="Please complete the previous steps first."
        />
        <div className="mt-4">
          <button
            onClick={handlePreviousStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const handleSendOverrideOTP = () => {
    if (!booking || !patient) {
      toast.error("Booking or patient information is missing.");
      return;
    }
    requestConsentOtpOverride(
      { booking_id: booking.bookingId },
      {
        onSuccess: (data) => {
          if (data.otp_code) {
            setGeneratedOverrideOtp(data.otp_code);
            toast.success(`Override OTP Code: ${data.otp_code}`);
            setTimeout(() => setShowOverrideOTP(true), 1000);
          } else {
            toast.error("No OTP code returned from server.");
          }
        },
        onError: () => {},
      }
    );
  };

  // Handler for override OTP validation
  const handleValidateOverrideOTP = (otp: string) => {
    if (!booking) {
      toast.error("Booking information is missing.");
      return;
    }
    validateConsentOverrideOtp({
      booking_id: booking.bookingId,
      otp_code: otp,
    });
  };

  const handleSendOTP = () => {
    if (!booking || !patient) {
      toast.error("Booking or patient information is missing.");
      return;
    }
    setOtpSent(true);

    requestPatientConsentOtp(
      { booking_id: booking.bookingId },
      {
        onSuccess: (data) => {
          if (data.otp_code) {
            setGeneratedOtp(data.otp_code);
            toast.success(`OTP Code: ${data.otp_code}`);
            setTimeout(() => setShowOTP(true), 1000);
          } else {
            toast.error("No OTP code returned from server.");
            setOtpSent(false);
          }
        },
        onError: () => {
          setOtpSent(false);
        },
      }
    );
  };

  const handleValidateOTP = (otp: string) => {
    if (!booking) {
      toast.error("Booking information is missing.");
      return;
    }
    validateOtpMutation({
      booking_id: booking.bookingId,
      otp_code: otp,
    });
  };

  const handleRejectConsent = () => {
    setConsentStatus("rejected");
  };

  const handleRetry = () => {
    setShowOTP(false);
    setOtpSent(false);
    setConsentStatus("pending");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Patient Consent</h2>
        <div>
          <span className="text-gray-600 mr-2">Patient:</span>
          <span className="font-medium">{patient.patientName}</span>
        </div>
      </div>

      {showOverrideOTP ? (
        <OTPValidation
          title="Facility Manager OTP Override"
          description="Enter the override OTP sent to the facility manager for this booking."
          onValidate={handleValidateOverrideOTP}
          onCancel={() => setShowOverrideOTP(false)}
          processingLabel={
            isOverrideValidating ? "Verifying..." : "Verify Override"
          }
          initialOtp={generatedOverrideOtp ?? ""}
        />
      ) : consentStatus === "approved" ? (
        <StatusCard
          title="Consent Obtained"
          status="success"
          message="Patient has provided consent for the service."
          details="Proceeding to service validation..."
        />
      ) : consentStatus === "rejected" ? (
        <div className="mb-6">
          <StatusCard
            title="Consent Rejected"
            status="error"
            message="Patient has not provided consent or OTP validation failed."
            details="Please retry or go back to the previous step."
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      ) : showOTP ? (
        <OTPValidation
          title="Verify Patient Consent"
          description={`Please enter the 6-digit OTP sent to ${patient.mobileNumber} to confirm consent for ${selectedService.description}.`}
          onValidate={handleValidateOTP}
          onCancel={handleRejectConsent}
          processingLabel={isValidating ? "Verifying..." : "Verify Consent"}
          initialOtp={generatedOtp ?? ""}
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Service Consent Form
            </h3>
            <button
              onClick={handleSendOverrideOTP}
              className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Override OTP
            </button>
          </div>
          {/* ...rest of your form as before... */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              The patient is required to provide consent for the following
              service:
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Service Name</p>
                  <p className="font-medium">{selectedService.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost</p>
                  <p className="font-medium">
                    Ksh {selectedService.shaRate.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    By providing consent, the patient agrees to undergo the
                    diagnostic service and accepts any associated costs as
                    mentioned.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h4 className="font-medium mb-2">Consent Verification Process</h4>
            <p className="text-gray-700 text-sm">
              A one-time password (OTP) will be sent to the patient&apos;s
              registered mobile number for verification. The patient must
              provide this OTP to confirm consent.
            </p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handlePreviousStep}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Back
            </button>
            <div className="space-x-3">
              <button
                onClick={handleRejectConsent}
                className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Decline
              </button>
              <button
                onClick={handleSendOTP}
                disabled={otpSent}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {otpSent ? "OTP Sent..." : "Send OTP & Get Consent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientConsent;
