"use client";

import {
  goToNextStep,
  goToPreviousStep,
  validateService,
} from "@/context/workflowSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useState } from "react";
import OTPValidation from "../../components/OTPValidation";
import StatusCard from "../../components/StatusCard";

const ServiceValidation: React.FC = () => {
  const { patient, selectedService, consentObtained } = useAppSelector(
    (store) => store.workflow
  );
  const dispatch = useAppDispatch();
  const [showOTP, setShowOTP] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [otpSent, setOtpSent] = useState(false);

  // Ensure hooks are always called in the same order
  const handleSendOTP = () => {
    setOtpSent(true);
    setTimeout(() => {
      setShowOTP(true);
    }, 1000);
  };

  const handleValidateOTP = (otp: string) => {
    if (otp === "123456") {
      setValidationStatus("approved");
      dispatch(validateService(true));

      setTimeout(() => {
        dispatch(goToNextStep());
      }, 1500);
    } else {
      setValidationStatus("rejected");
    }
  };

  const handleRejectValidation = () => {
    setValidationStatus("rejected");
    dispatch(validateService(false));
  };

  const handleRetry = () => {
    setShowOTP(false);
    setOtpSent(false);
    setValidationStatus("pending");
  };

  // Conditional rendering for JSX only

  React.useEffect(() => {
    console.log("workflow state", {
      patient,
      selectedService,
      consentObtained,
    });
  }, [patient, selectedService, consentObtained]);

  if (!patient || !selectedService || !consentObtained) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusCard
          title="Prerequisites Missing"
          status="error"
          message="Patient consent or service information is missing."
          details="Please complete the previous steps first."
        />
        <div className="mt-4">
          <button
            onClick={() => goToPreviousStep()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Service Validation</h2>
        <div>
          <span className="text-gray-600 mr-2">Service:</span>
          <span className="font-medium">{selectedService.description}</span>
        </div>
      </div>

      {validationStatus === "approved" ? (
        <StatusCard
          title="Service Validated"
          status="success"
          message="The service booking has been confirmed and validated."
          details="Proceeding to service execution..."
        />
      ) : validationStatus === "rejected" ? (
        <div className="mb-6">
          <StatusCard
            title="Validation Failed"
            status="error"
            message="Service validation was not successful or OTP verification failed."
            details="Please retry or contact the service department."
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
          title="Validate Service Booking"
          description={`Please enter the 6-digit OTP sent to the technician to confirm service booking for ${selectedService.description}.`}
          onValidate={handleValidateOTP}
          onCancel={handleRejectValidation}
          processingLabel="Confirm Booking"
        />
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Service Booking Validation
          </h3>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              This step confirms the booking of the diagnostic service with the
              relevant department or technician.
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-medium">{patient.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
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

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Patient consent has been obtained. Now the service
                    department needs to confirm availability and readiness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h4 className="font-medium mb-2">Validation Process</h4>
            <p className="text-gray-700 text-sm">
              A one-time password (OTP) will be sent to the service technician
              or department head. The OTP must be entered to confirm that the
              service can be performed as scheduled.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => dispatch(goToPreviousStep())}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Back
            </button>
            <div className="space-x-3">
              <button
                onClick={handleRejectValidation}
                className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Cancel Booking
              </button>
              <button
                onClick={handleSendOTP}
                disabled={otpSent}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {otpSent ? "OTP Sent..." : "Send OTP & Validate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceValidation;
