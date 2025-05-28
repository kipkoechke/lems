"use client";

import {
  completeService,
  goToNextStep,
  goToPreviousStep,
} from "@/context/workflowSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useEffect, useState } from "react";
import OTPValidation from "../../../components/OTPValidation";
import StatusCard from "../../../components/StatusCard";

const ServiceFulfillment: React.FC = () => {
  const { patient, selectedService, consentObtained } = useAppSelector(
    (store) => store.workflow
  );
  const dispatch = useAppDispatch();
  const [showOTP, setShowOTP] = useState(false);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<
    "pending" | "completed" | "failed"
  >("pending");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = () => {
    setOtpSent(true);
    setTimeout(() => {
      setShowOTP(true);
    }, 1000);
  };

  useEffect(() => {
    handleSendOTP();
  }, []);

  const handleValidateOTP = (otp: string) => {
    if (otp === "123456") {
      setFulfillmentStatus("completed");
      dispatch(completeService(true));

      setTimeout(() => {
        dispatch(goToNextStep());
      }, 1500);
    } else {
      setFulfillmentStatus("failed");
    }
  };

  const handleCancelFulfillment = () => {
    setFulfillmentStatus("failed");
    dispatch(completeService(false));
  };

  const handleRetry = () => {
    setShowOTP(false);
    setOtpSent(false);
    setFulfillmentStatus("pending");
  };

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
            onClick={() => dispatch(goToPreviousStep())}
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
        <h2 className="text-2xl font-bold">Service Fulfillment</h2>
        <div>
          <span className="text-gray-600 mr-2">Service:</span>
          <span className="font-medium">{selectedService.description}</span>
        </div>
      </div>

      {fulfillmentStatus === "completed" ? (
        <StatusCard
          title="Service Completed"
          status="success"
          message="The diagnostic service has been successfully completed."
          details="The results will be available shortly."
        />
      ) : fulfillmentStatus === "failed" ? (
        <div className="mb-6">
          <StatusCard
            title="Fulfillment Failed"
            status="error"
            message="Service fulfillment was not successful or OTP verification failed."
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
          title="Confirm Service Completion"
          description={`Please enter the 6-digit OTP sent to the technician to confirm that the service ${selectedService.description} has been completed.`}
          onValidate={handleValidateOTP}
          onCancel={handleCancelFulfillment}
          processingLabel="Confirm Completion"
        />
      ) : (
        /*    <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Diagnostic Service Fulfillment
          </h3>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              This step confirms that the diagnostic service has been performed
              and completed.
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{patient.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-medium">{patient.patientId}</p>
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

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    The diagnostic service has been conducted. Please confirm
                    completion to finalize the process.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h4 className="font-medium mb-2">Completion Verification</h4>
            <p className="text-gray-700 text-sm">
              A one-time password (OTP) will be sent to the service technician
              or department head. The OTP must be entered to confirm that the
              service has been successfully completed.
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
                onClick={handleCancelFulfillment}
                className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Service Incomplete
              </button>
              <button
                onClick={handleSendOTP}
                disabled={otpSent}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {otpSent ? "OTP Sent..." : "Send OTP & Complete"}
              </button>
            </div>
          </div>
        </div>*/
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-500">Sending OTP to patient...</span>
        </div>
      )}
    </div>
  );
};

export default ServiceFulfillment;
