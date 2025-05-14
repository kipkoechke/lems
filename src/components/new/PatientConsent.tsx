"use client";
import { useWorkflow } from "@/context/WorkflowContext";
import React, { useState } from "react";
import OTPValidation from "./OTPValidation";
import StatusCard from "./StatusCard";

const PatientConsent: React.FC = () => {
  const { state, dispatch, goToNextStep, goToPreviousStep } = useWorkflow();
  const [showOTP, setShowOTP] = useState(false);
  const [consentStatus, setConsentStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [otpSent, setOtpSent] = useState(false);

  if (!state.patient || !state.selectedService) {
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
            onClick={goToPreviousStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const handleSendOTP = () => {
    // Simulate sending OTP to patient's contact number
    setOtpSent(true);
    setTimeout(() => {
      setShowOTP(true);
    }, 1000);
  };

  const handleValidateOTP = (otp: string) => {
    // Simulate OTP validation
    // In a real scenario, this would make an API call to validate the OTP
    if (otp === "123456") {
      setConsentStatus("approved");
      dispatch({ type: "SET_CONSENT", payload: true });

      // Move to the next step after a short delay
      setTimeout(() => {
        goToNextStep();
      }, 1500);
    } else {
      setConsentStatus("rejected");
    }
  };

  const handleRejectConsent = () => {
    setConsentStatus("rejected");
    dispatch({ type: "SET_CONSENT", payload: false });
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
          <span className="font-medium">{state.patient.patientName}</span>
        </div>
      </div>

      {consentStatus === "approved" ? (
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
          description={`Please enter the 6-digit OTP sent to ${state.patient.mobileNumber} to confirm consent for ${state.selectedService.description}.`}
          onValidate={handleValidateOTP}
          onCancel={handleRejectConsent}
          processingLabel="Verify Consent"
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Service Consent Form
          </h3>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              The patient is required to provide consent for the following
              service:
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Service Name</p>
                  <p className="font-medium">
                    {state.selectedService.description}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost</p>
                  <p className="font-medium">
                    Ksh {state.selectedService.shaRate.toLocaleString()}
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
              onClick={goToPreviousStep}
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
