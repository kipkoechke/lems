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
import OTPValidation from "../../../components/OTPValidation";
import StatusCard from "../../../components/StatusCard";
import { useFulfillmentOtp } from "./useFulfillmentOtp";
import { useValidateServiceFulfillmentOtp } from "./useValidateServiceFulfillmentOtp";

const ServiceFulfillment: React.FC = () => {
  const { patient, selectedService, consentObtained } = useAppSelector(
    (store) => store.workflow
  );
  const { booking } = useAppSelector((store) => store.workflow);
  const bookingNumber = booking?.booking_number;

  // Debug logging
  console.log("=== SERVICE FULFILLMENT DEBUG ===");
  console.log("Full booking object:", booking);
  console.log("Booking number for fulfillment:", bookingNumber);
  console.log("Booking ID (should not be used):", booking?.bookingId);

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

  // Send fulfillment OTP via API
  const handleSendOTP = () => {
    console.log("=== REQUESTING SERVICE FULFILLMENT OTP ===");
    console.log("Booking number:", bookingNumber);

    if (!bookingNumber) {
      console.error("No booking number available for OTP request");
      setFulfillmentStatus("failed");
      return;
    }
    setOtpSent(true);
    requestFulfillmentOtp(bookingNumber, {
      onSuccess: (data: { otp_code?: string }) => {
        console.log("=== OTP REQUEST SUCCESS ===");
        console.log("Response data:", data);

        if (data?.otp_code) {
          setGeneratedOtp(data.otp_code);
          toast.success(`Fulfillment OTP: ${data.otp_code}`);
        }
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

  // Validate OTP via API
  const handleValidateOTP = (otp: string) => {
    console.log("=== VALIDATING SERVICE FULFILLMENT OTP ===");
    console.log("Booking number:", bookingNumber);
    console.log("OTP code:", otp);

    if (!bookingNumber) {
      console.error("No booking number available for OTP validation");
      setFulfillmentStatus("failed");
      return;
    }
    validateOtpMutation(
      { data: { booking_number: bookingNumber, otp_code: otp } },
      {
        onSuccess: (response) => {
          console.log("=== OTP VALIDATION SUCCESS ===");
          console.log("Response:", response);

          dispatch(setBooking({ ...booking, serviceCompletion: "completed" }));
          setFulfillmentStatus("completed");
          setShowOTP(false);
          dispatch(completeService(true));
        },
        onError: (error) => {
          console.error("=== OTP VALIDATION ERROR ===");
          console.error("Error:", error);
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
        <h2 className="text-xl font-bold">Service Fulfillment</h2>
        <div>
          <span className="text-gray-600 mr-2">Service:</span>
          <span className="font-medium">{selectedService.description}</span>
        </div>
      </div>

      {fulfillmentStatus === "completed" ? (
        <StatusCard
          title="Service Fulfilled"
          status="success"
          message="The diagnostic service has been successfully fulfilled."
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
          title="Confirm Service Fulfillment"
          description={`Please enter the 6-digit OTP sent to the technician to confirm that the service ${selectedService.description} has been fulfilled.`}
          onValidate={handleValidateOTP}
          onCancel={handleCancelFulfillment}
          processingLabel={
            isValidating ? "Confirming..." : "Confirm Fulfillment"
          }
          initialOtp={generatedOtp ?? ""}
        />
      ) : (
        <div className="flex items-center justify-center h-32">
          <span className="text-gray-500">
            {isRequesting || otpSent ? "Sending OTP..." : "Preparing..."}
          </span>
        </div>
      )}
    </div>
  );
};

export default ServiceFulfillment;
