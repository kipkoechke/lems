/* eslint-disable react-hooks/rules-of-hooks */

"use client";

import { goToPreviousStep } from "@/context/workflowSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    handleSendOTP();
  }, [booking, patient]);

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

  // // Automatically send OTP when component mounts and booking exists
  // useEffect(() => {
  //   if (
  //     booking &&
  //     patient &&
  //     consentStatus === "pending" &&
  //     !showOTP &&
  //     !otpSent
  //   ) {
  //     setOtpSent(true);
  //     requestPatientConsentOtp(
  //       { booking_id: booking.bookingId },
  //       {
  //         onSuccess: (data) => {
  //           if (data.otp_code) {
  //             setGeneratedOtp(data.otp_code);
  //             toast.success(`OTP Code: ${data.otp_code}`);
  //             setTimeout(() => setShowOTP(true), 500);
  //           } else {
  //             toast.error("No OTP code returned from server.");
  //             setOtpSent(false);
  //           }
  //         },
  //         onError: () => {
  //           setOtpSent(false);
  //         },
  //       }
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [booking, patient]);

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
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-500">Sending OTP to patient...</span>
        </div>
      )}
    </div>
  );
};

export default PatientConsent;
