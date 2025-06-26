/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { goToNextStep, goToPreviousStep } from "@/context/workflowSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import OTPValidation from "../../components/OTPValidation";
import StatusCard from "../../components/StatusCard";
import { usePatientConsentOverride } from "./useConsentOverride";
import { useOtpValidation } from "./useValidateOtp";
import { useOtpValidationOverride } from "./useValidateOverride";

const PatientConsent: React.FC = () => {
  const { patient, selectedService, booking, otp_code } = useAppSelector(
    (store) => store.workflow
  );

  console.log("PatientConsent - Workflow state:", {
    patient: patient?.name,
    booking: booking?.bookingId,
    otp_code,
    fullWorkflow: useAppSelector((store) => store.workflow),
  });

  const dispatch = useAppDispatch();
  const { requestConsentOtpOverride, isRegistering: isOverrideRegistering } =
    usePatientConsentOverride();
  const { validateConsentOverrideOtp, isValidating: isOverrideValidating } =
    useOtpValidationOverride();
  const { validateOtpMutation, isValidating } = useOtpValidation();

  const [showOTP, setShowOTP] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [generatedOverrideOtp, setGeneratedOverrideOtp] = useState<
    string | null
  >(null);
  const [showOverrideOTP, setShowOverrideOTP] = useState(false);
  const [consentStatus, setConsentStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [otpSent, setOtpSent] = useState(false);
  const [overrideSent, setOverrideSent] = useState(false);

  // Check if booking was created with override
  const isBookingOverridden = booking?.otpOverridden || false;

  const handleSendOTP = () => {
    console.log("handleSendOTP called", {
      booking,
      patient,
      otp_code,
      isBookingOverridden,
    });

    if (!booking || !patient) {
      toast.error("Booking or patient information is missing.");
      return;
    }

    // If booking was created with override, skip normal OTP and go to next step
    if (isBookingOverridden) {
      console.log(
        "Booking was created with override, skipping patient consent..."
      );
      setConsentStatus("approved");
      toast.success("Booking was approved via emergency override");
      setTimeout(() => {
        dispatch(goToNextStep());
      }, 1000);
      return;
    }

    // OTP should already be available from booking creation
    if (otp_code) {
      console.log("OTP found:", otp_code);
      setGeneratedOtp(otp_code);
      toast.success(`Patient Consent OTP: ${otp_code}`);
      setTimeout(() => setShowOTP(true), 1000);
      setOtpSent(true);
    } else {
      console.log("No OTP available in workflow state");
      toast.error("No OTP available. Please contact support.");
      setOtpSent(false);
    }
  };

  const handleSendOverrideOTP = () => {
    if (!booking || !patient) {
      toast.error("Booking or patient information is missing.");
      return;
    }

    setOverrideSent(true);
    requestConsentOtpOverride(
      { booking_id: booking.bookingId },
      {
        onSuccess: (data) => {
          if (data.otp_code) {
            setGeneratedOverrideOtp(data.otp_code);
            toast.success(`Manager Override OTP: ${data.otp_code}`);
            setTimeout(() => setShowOverrideOTP(true), 1000);
            setOverrideSent(false);
          } else {
            toast.error("No override OTP code returned from server.");
            setOverrideSent(false);
          }
        },
        onError: (error) => {
          console.error("Failed to send override OTP:", error);
          toast.error("Failed to send override OTP");
          setOverrideSent(false);
        },
      }
    );
  };

  const handleValidatePatientOTP = (otp: string) => {
    console.log("PatientConsent - handleValidatePatientOTP called");
    console.log("PatientConsent - booking object:", booking);
    console.log("PatientConsent - booking type:", typeof booking);

    if (!booking) {
      console.log("PatientConsent - No booking object found");
      toast.error("Booking information is missing.");
      return;
    }

    console.log("PatientConsent - Validating OTP with booking:", booking);
    console.log(
      "PatientConsent - Available booking fields:",
      Object.keys(booking)
    );
    console.log(
      "PatientConsent - All booking data:",
      JSON.stringify(booking, null, 2)
    );

    // Try different possible fields for booking number
    const bookingAny = booking as any;
    const bookingNumber =
      booking.booking_number ||
      booking.bookingId ||
      bookingAny.booking_id ||
      bookingAny.id ||
      bookingAny.number;
    console.log("=== BOOKING NUMBER DETECTION ===");
    console.log("PatientConsent - Trying these fields for booking number:");
    console.log("  booking.booking_number:", booking.booking_number);
    console.log("  booking.bookingId:", booking.bookingId);
    console.log("  booking.booking_id:", bookingAny.booking_id);
    console.log("  booking.id:", bookingAny.id);
    console.log("  booking.number:", bookingAny.number);
    console.log("PatientConsent - Selected booking number:", bookingNumber);

    if (!bookingNumber) {
      console.log(
        "PatientConsent - No booking identifier found in booking object"
      );
      console.log(
        "PatientConsent - Available booking fields:",
        Object.keys(booking)
      );
      toast.error("Booking ID is missing from booking data.");
      return;
    }

    const requestPayload = {
      otp_code: otp,
      booking_number: bookingNumber, // Use booking_number for verifyPatientConsent API
    };
    console.log(
      "PatientConsent - Sending validation request with booking_number:",
      requestPayload
    );

    validateOtpMutation(
      requestPayload, // Use the requestPayload object
      {
        onSuccess: (data) => {
          console.log("Patient consent verification successful:", data);
          setConsentStatus("approved");
          toast.success("Patient consent verified successfully!");
          setShowOTP(false);

          // Proceed to next step
          setTimeout(() => {
            dispatch(goToNextStep());
          }, 1000);
        },
        onError: (error) => {
          console.error("=== PATIENT CONSENT VALIDATION ERROR ===");
          console.error("Patient consent verification failed:", error);
          console.error("Error details:", (error as any).response?.data);
          console.error("Request payload that failed:", requestPayload);
          console.error("Full error object:", error);
          toast.error("Invalid OTP. Please try again.");
        },
      }
    );
  };

  const handleValidateOverrideOTP = (otp: string) => {
    if (!booking) {
      toast.error("Booking information is missing.");
      return;
    }

    validateConsentOverrideOtp(
      {
        booking_id: booking.bookingId,
        otp_code: otp,
      },
      {
        onSuccess: (data) => {
          console.log("Override OTP validation successful:", data);
          setConsentStatus("approved");
          toast.success("Manager override approved successfully!");
          setShowOverrideOTP(false);

          // Proceed to next step
          setTimeout(() => {
            dispatch(goToNextStep());
          }, 1000);
        },
        onError: (error) => {
          console.error("Override OTP validation failed:", error);
          toast.error("Invalid override OTP. Please try again.");
        },
      }
    );
  };

  const handleCancelOTP = () => {
    setShowOTP(false);
    setGeneratedOtp(null);
    toast("Patient consent cancelled");
  };

  const handleCancelOverrideOTP = () => {
    setShowOverrideOTP(false);
    setGeneratedOverrideOtp(null);
    toast("Override OTP cancelled");
  };

  const handleRejectConsent = () => {
    setConsentStatus("rejected");
    toast.error("Patient consent has been rejected");
  };

  const handlePreviousStep = () => {
    dispatch(goToPreviousStep());
  };

  useEffect(() => {
    console.log("PatientConsent useEffect triggered", {
      booking,
      patient,
      otp_code,
      otpSent,
    });

    if (booking && patient && !otpSent) {
      // Check if OTP is available from booking creation (stored in workflow state)
      if (otp_code) {
        console.log("OTP found in workflow state:", otp_code);
        setGeneratedOtp(otp_code);
        toast.success(`Patient Consent OTP: ${otp_code}`);
        setTimeout(() => setShowOTP(true), 1000);
        setOtpSent(true);
      } else {
        console.log("No OTP in workflow state, trying fallback");
        // Fallback: if no OTP in workflow state, request one (shouldn't happen in new flow)
        handleSendOTP();
      }
    }
  }, [booking, patient, otp_code]);

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

  const buttonClasses = `
    px-6 py-3 min-w-[140px]
    font-semibold text-sm
    rounded-lg shadow-sm
    transition-all duration-200
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
    hover:shadow-md
    flex items-center justify-center
    disabled:cursor-not-allowed
  `;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Patient OTP Modal */}
      {showOTP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <OTPValidation
              title="Patient Consent Verification"
              description={`Enter the OTP sent to ${patient.name} (${patient.phone}) to confirm consent for ${selectedService.serviceName}.`}
              onValidate={handleValidatePatientOTP}
              onCancel={handleCancelOTP}
              processingLabel={isValidating ? "Verifying..." : "Verify Consent"}
              initialOtp={generatedOtp ?? ""}
            />
          </div>
        </div>
      )}

      {/* Override OTP Modal */}
      {showOverrideOTP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <OTPValidation
              title="Manager Override OTP"
              description="Enter the override OTP sent to the facility manager to approve this booking without patient consent."
              onValidate={handleValidateOverrideOTP}
              onCancel={handleCancelOverrideOTP}
              processingLabel={
                isOverrideValidating ? "Verifying..." : "Verify Override"
              }
              initialOtp={generatedOverrideOtp ?? ""}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl px-8 py-6 border border-gray-200">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Patient Consent Verification
          </h2>
          <p className="text-gray-600">
            Verifying patient consent for the requested medical service
          </p>
        </div>

        {/* Booking Override Indicator */}
        {isBookingOverridden && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-medium">
                Emergency Override Applied
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              This booking was approved via emergency override and bypassed
              patient consent requirements.
            </p>
          </div>
        )}

        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Patient Details
            </h3>
            <p>
              <span className="font-medium">Name:</span> {patient.name}
            </p>
            <p>
              <span className="font-medium">Phone:</span> {patient.phone}
            </p>
            <p>
              <span className="font-medium">ID:</span> {patient.id}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Service Details
            </h3>
            <p>
              <span className="font-medium">Service:</span>{" "}
              {selectedService.serviceName}
            </p>
            <p>
              <span className="font-medium">Cost:</span> KSh{" "}
              {selectedService.shaRate?.toLocaleString()}
            </p>
            {booking && (
              <p>
                <span className="font-medium">Booking ID:</span>{" "}
                {booking.bookingId}
              </p>
            )}
          </div>
        </div>

        {/* Consent Status */}
        <div className="mb-8">
          <StatusCard
            title="Consent Status"
            status={
              consentStatus === "pending"
                ? "pending"
                : consentStatus === "approved"
                ? "success"
                : "error"
            }
            message={
              consentStatus === "pending"
                ? isBookingOverridden
                  ? "Approved via emergency override"
                  : otpSent
                  ? "Waiting for patient consent verification..."
                  : "Sending consent verification..."
                : consentStatus === "approved"
                ? "Patient consent has been verified successfully"
                : "Patient consent has been rejected"
            }
            details={
              consentStatus === "pending"
                ? isBookingOverridden
                  ? "This booking was processed as an emergency case"
                  : "An OTP has been sent to the patient's phone number for verification"
                : consentStatus === "approved"
                ? "The patient has successfully confirmed their consent for this service"
                : "The booking cannot proceed without patient consent"
            }
          />
        </div>

        {/* Action Buttons */}
        {!isBookingOverridden && consentStatus === "pending" && (
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={handlePreviousStep}
                className={`${buttonClasses} bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500`}
              >
                Back
              </button>

              <button
                onClick={handleRejectConsent}
                className={`${buttonClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`}
              >
                Reject Consent
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSendOTP}
                disabled={otpSent}
                className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-gray-400`}
              >
                {otpSent ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    OTP Already Sent
                  </>
                ) : (
                  "Get OTP"
                )}
              </button>

              <button
                onClick={handleSendOverrideOTP}
                disabled={isOverrideRegistering || overrideSent}
                className={`${buttonClasses} bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 disabled:bg-gray-400`}
              >
                {isOverrideRegistering || overrideSent ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Requesting Override...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Manager Override
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation for approved/rejected states */}
        {(consentStatus === "approved" ||
          consentStatus === "rejected" ||
          isBookingOverridden) && (
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handlePreviousStep}
              className={`${buttonClasses} bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500`}
            >
              Back
            </button>

            {(consentStatus === "approved" || isBookingOverridden) && (
              <button
                onClick={() => dispatch(goToNextStep())}
                className={`${buttonClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`}
              >
                Continue to Next Step
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientConsent;
