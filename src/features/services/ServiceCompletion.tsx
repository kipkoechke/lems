"use client";

import OTPValidation from "@/components/OTPValidation";
import { useAppSelector } from "@/hooks/hooks";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaCheckCircle, FaStethoscope } from "react-icons/fa";
import { useServiceCompletionOtp } from "./useServiceCompletionOtp";
import { useVerifyServiceCompletionOtp } from "./useVerifyServiceCompletionOtp";

interface ServiceCompletionProps {
  onComplete?: () => void;
}

const ServiceCompletion: React.FC<ServiceCompletionProps> = ({
  onComplete,
}) => {
  const { booking, patient, selectedService } = useAppSelector(
    (store) => store.workflow
  );
  const { requestOtp, isRequesting } = useServiceCompletionOtp();
  const { verifyOtp, isVerifying } = useVerifyServiceCompletionOtp();

  const [showOTP, setShowOTP] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<
    "pending" | "requesting" | "verifying" | "completed"
  >("pending");

  console.log("ServiceCompletion - Workflow state:", {
    booking: booking?.booking_number,
    patient: patient?.name,
    service: selectedService?.serviceName,
  });

  const handleRequestOTP = () => {
    if (!booking?.booking_number) {
      toast.error("Booking number is missing. Please try again.");
      return;
    }

    setCompletionStatus("requesting");
    requestOtp(
      { booking_number: booking.booking_number },
      {
        onSuccess: (response) => {
          console.log("Service completion OTP requested:", response);
          setGeneratedOtp(response.otp_code);
          toast.success(`Service Completion OTP: ${response.otp_code}`);
          setTimeout(() => setShowOTP(true), 1000);
          setCompletionStatus("verifying");
        },
        onError: (error) => {
          console.error("Failed to request service completion OTP:", error);
          toast.error("Failed to request OTP for service completion");
          setCompletionStatus("pending");
        },
      }
    );
  };

  const handleVerifyOTP = (otp: string) => {
    if (!booking?.booking_number) {
      toast.error("Booking number is missing. Please try again.");
      return;
    }

    verifyOtp(
      {
        booking_number: booking.booking_number,
        otp_code: otp,
      },
      {
        onSuccess: (response) => {
          console.log("Service completion verified:", response);
          setCompletionStatus("completed");
          toast.success("Service completion verified successfully!");
          setShowOTP(false);

          // Call the completion callback if provided
          if (onComplete) {
            setTimeout(() => {
              onComplete();
            }, 1000);
          }
        },
        onError: (error) => {
          console.error("Service completion verification failed:", error);
          toast.error("Invalid OTP. Please try again.");
        },
      }
    );
  };

  const handleCancelOTP = () => {
    setShowOTP(false);
    setGeneratedOtp(null);
    setCompletionStatus("pending");
    toast("Service completion OTP cancelled");
  };

  if (!patient || !selectedService || !booking) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl px-8 py-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Service Completion
          </h2>
          <p className="text-red-600">
            Missing booking, patient, or service information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* OTP Modal */}
      {showOTP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <OTPValidation
              title="Service Completion Verification"
              description={`Enter the OTP to confirm completion of ${selectedService.serviceName} for ${patient.name}.`}
              onValidate={handleVerifyOTP}
              onCancel={handleCancelOTP}
              processingLabel={
                isVerifying ? "Verifying..." : "Verify Completion"
              }
              initialOtp={generatedOtp ?? ""}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl px-8 py-6 border border-gray-200">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaStethoscope className="text-green-600 text-xl" />
            </div>
            Service Completion
          </h2>
          <p className="text-gray-600">
            Verify that the medical service has been completed
          </p>
        </div>

        {/* Service Information */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Patient:</span>
              <p className="text-gray-600">{patient.name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Service:</span>
              <p className="text-gray-600">{selectedService.serviceName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Booking Number:</span>
              <p className="text-gray-600 font-mono">
                {booking.booking_number}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-gray-600 capitalize">{completionStatus}</p>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        {completionStatus === "completed" && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <div className="p-1 bg-green-100 rounded-full mr-3">
                <FaCheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-green-800 font-semibold">
                Service Completed Successfully
              </span>
            </div>
            <p className="text-green-700 text-sm mt-2 ml-8">
              The medical service has been verified as completed.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          {completionStatus === "pending" && (
            <button
              onClick={handleRequestOTP}
              disabled={isRequesting}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isRequesting ? "Requesting OTP..." : "Mark Service as Completed"}
            </button>
          )}

          {completionStatus === "requesting" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">
                Requesting verification OTP...
              </p>
            </div>
          )}

          {completionStatus === "verifying" && (
            <button
              onClick={() => setShowOTP(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Enter Verification OTP
            </button>
          )}

          {completionStatus === "completed" && onComplete && (
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCompletion;
