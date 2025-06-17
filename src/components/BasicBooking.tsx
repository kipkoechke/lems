import {
  goToNextStep,
  selectCategory,
  // selectEquipment,
  selectFacility,
  selectPaymentMode,
  selectService,
  setBooking,
  setPatient,
} from "@/context/workflowSlice";
// import { useEquipmentByService } from "@/features/equipments/userServiceEquipment";
import { useFacilities } from "@/features/facilities/useFacilities";
import PatientRegistration from "@/features/patients/PatientRegistration";
import { usePatients } from "@/features/patients/usePatients";
import { usePaymentModes } from "@/features/paymentModes/usePaymentModes";
import { useCreateBooking } from "@/features/services/bookings/useCreateBooking";
import { useCategories } from "@/features/services/categories/useCategories";
import { useServiceByCategory } from "@/features/services/useServiceByCategory";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Patient } from "@/services/apiPatient";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { usePatientConsentOverride } from "@/features/patients/useConsentOverride";
import { usePatientConsent } from "@/features/patients/usePatientConsent";
import { useOtpValidation } from "@/features/patients/useValidateOtp";
import { useOtpValidationOverride } from "@/features/patients/useValidateOverride";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";
import {
  FaHospital,
  FaMoneyBillWave,
  FaStethoscope,
  FaUserCheck,
  FaUserPlus,
  FaUserShield,
} from "react-icons/fa6";
import Modal from "./Modal";
import OTPValidation from "./OTPValidation";

const BasicBookingStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = usePatients();
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  // const { equipments } = useEquipmentByService(selectedServiceId);
  const { facilities } = useFacilities();
  const { paymentModes } = usePaymentModes();
  const { createBooking, isCreating } = useCreateBooking();
  const { categories } = useCategories();

  // Patient consent hooks
  const { requestPatientConsentOtp, isRegistering: isPatientOtpRegistering } =
    usePatientConsent();
  const { validateOtpMutation, isValidating: isPatientOtpValidating } =
    useOtpValidation();

  // Override OTP hooks
  const { requestConsentOtpOverride, isRegistering: isOverrideRegistering } =
    usePatientConsentOverride();
  const { validateConsentOverrideOtp, isValidating: isOverrideValidating } =
    useOtpValidationOverride();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const { services } = useServiceByCategory(selectedCategoryId);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  // const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [selectedPaymentModeId, setSelectedPaymentModeId] =
    useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [isOverrideMode, setIsOverrideMode] = useState<boolean>(false);

  // Booking states
  const [bookingCreated, setBookingCreated] = useState<boolean>(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);

  // Patient OTP states (for normal flow)
  const [showPatientOTP, setShowPatientOTP] = useState<boolean>(false);
  const [generatedPatientOtp, setGeneratedPatientOtp] = useState<string | null>(
    null
  );
  const booking = useAppSelector((store) => store.workflow.booking);

  const [patientConsentVerified, setPatientConsentVerified] =
    useState<boolean>(false);

  // Override OTP states (for emergency flow)
  const [showOverrideOTP, setShowOverrideOTP] = useState<boolean>(false);
  const [generatedOverrideOtp, setGeneratedOverrideOtp] = useState<
    string | null
  >(null);
  const [overrideVerified, setOverrideVerified] = useState<boolean>(false);

  const handleAddPatient = (newPatient: Patient) => {
    setSelectedPatientId(newPatient.patientId);
    dispatch(setPatient(newPatient));
  };

  const validateAllFields = () => {
    const patient = patients?.find((p) => p.patientId === selectedPatientId);
    const category = categories?.find(
      (c) => c.categoryId === selectedCategoryId
    );
    const service = services?.find((s) => s.serviceId === selectedServiceId);
    // const equipment = equipments?.find(
    //   (e) => e.equipmentId === selectedEquipmentId
    // );
    const facility = facilities?.find(
      (f) => f.facilityId === selectedFacilityId
    );
    const paymentMode = paymentModes?.find(
      (pm) => pm.paymentModeId === selectedPaymentModeId
    );

    if (
      !patient ||
      !category ||
      !service ||
      // !equipment ||
      !facility ||
      !paymentMode ||
      !bookingDate
    ) {
      // toast.error("Please fill in all required fields");
      return null;
    }

    return {
      patient,
      category,
      service,
      // equipment,
      facility,
      paymentMode,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validatedFields = validateAllFields();
    if (!validatedFields) return;

    // If booking is not created yet, create it first
    if (!bookingCreated) {
      createBookingFirst(validatedFields);
      return;
    }

    // If booking is created, handle the flow based on mode
    if (isOverrideMode) {
      handleOverrideFlow();
    } else {
      handleNormalFlow();
    }
  };

  const createBookingFirst = (validatedFields: any) => {
    const {
      patient,
      category,
      service,
      /* equipment, */ facility,
      paymentMode,
    } = validatedFields;

    // Store all selections in Redux
    dispatch(setPatient(patient));
    dispatch(selectCategory(category));
    dispatch(selectService(service));
    // dispatch(selectEquipment(equipment));
    dispatch(selectFacility(facility));
    dispatch(selectPaymentMode(paymentMode));

    createBooking(
      {
        patient_id: patient.patientId,
        service_id: service.serviceId,
        // equipment_id: equipment.equipmentId,
        facility_id: facility.facilityId,
        booking_date: new Date(bookingDate),
        payment_mode_id: paymentMode.paymentModeId,
        status: "pending",
        notes: "",
        otp_overriden: isOverrideMode,
        cost: service.shaRate,
      },
      {
        onSuccess: (bookingData) => {
          toast.success("Booking created successfully!");
          dispatch(setBooking(bookingData));
          setCurrentBookingId(bookingData.bookingId);
          setBookingCreated(true);

          if (isOverrideMode) {
            toast(
              "Click 'Request Override OTP' to proceed with emergency booking"
            );
          } else {
            toast("Click 'Verify OTP and Book' to get patient consent");
          }
        },
        onError: () => {
          toast.error("Failed to create booking");
        },
      }
    );
  };

  const handleNormalFlow = () => {
    if (!patientConsentVerified) {
      handleSendPatientOTP();
    } else {
      dispatch(goToNextStep());
    }
  };

  const handleOverrideFlow = () => {
    if (!overrideVerified) {
      handleSendOverrideOTP();
    } else {
      dispatch(goToNextStep());
      dispatch(goToNextStep());
    }
  };

  const handleSendPatientOTP = () => {
    if (!currentBookingId) {
      toast.error("Booking information is missing. Please try again.");
      return;
    }

    requestPatientConsentOtp(
      { booking_id: currentBookingId },
      {
        onSuccess: (otpData) => {
          if (otpData.otp_code) {
            setGeneratedPatientOtp(otpData.otp_code);
            toast.success(`Patient Consent OTP: ${otpData.otp_code}`);
            setShowPatientOTP(true);
          } else {
            toast.error("No OTP code returned from server.");
          }
        },
        onError: () => {
          toast.error("Failed to send patient consent OTP");
        },
      }
    );
  };

  const handleSendOverrideOTP = () => {
    if (!currentBookingId) {
      toast.error("Booking information is missing. Please try again.");
      return;
    }

    requestConsentOtpOverride(
      { booking_id: currentBookingId },
      {
        onSuccess: (otpData) => {
          if (otpData.otp_code) {
            setGeneratedOverrideOtp(otpData.otp_code);
            toast.success(`Override OTP Code: ${otpData.otp_code}`);

            setShowOverrideOTP(true);
          } else {
            toast.error("No OTP code returned from server.");
          }
        },
        onError: () => {
          toast.error("Failed to send override OTP");
        },
      }
    );
  };

  const handleValidatePatientOTP = (otp: string) => {
    if (!currentBookingId) {
      toast.error("Booking information is missing. Please try again.");
      setShowPatientOTP(false);
      return;
    }

    validateOtpMutation(
      {
        booking_id: currentBookingId,
        otp_code: otp,
      },
      {
        onSuccess: () => {
          setPatientConsentVerified(true);
          setShowPatientOTP(false);
          if (booking) {
            dispatch(
              setBooking({
                ...booking,
                bookingId: booking.bookingId ?? "",
                status: "confirmed",
                cost: booking.cost ?? "",
              })
            );
          }
          toast.success("Patient consent verified successfully!");
          setGeneratedPatientOtp(null);

          dispatch(goToNextStep());
        },
        onError: () => {
          toast.error("Invalid patient consent OTP. Please try again.");
        },
      }
    );
  };

  const handleValidateOverrideOTP = (otp: string) => {
    if (!currentBookingId) {
      toast.error("Booking information is missing. Please try again.");
      setShowOverrideOTP(false);
      return;
    }

    validateConsentOverrideOtp(
      {
        booking_id: currentBookingId,
        otp_code: otp,
      },
      {
        onSuccess: () => {
          setOverrideVerified(true);
          setShowOverrideOTP(false);
          // dispatch(
          //   setBooking({
          //       ...booking,
          //       bookingId: booking.bookingId ?? "",
          //       status: "confirmed",
          //       cost: booking.cost ?? "",
          //   })
          // );
          toast.success("Override OTP verified successfully!");
          setGeneratedOverrideOtp(null);
          dispatch(goToNextStep());
          dispatch(goToNextStep());
        },
        onError: () => {
          toast.error("Invalid override OTP. Please try again.");
        },
      }
    );
  };

  const handleCancelPatientOTP = () => {
    setShowPatientOTP(false);
    setGeneratedPatientOtp(null);
    toast("Patient consent OTP cancelled");
  };

  const handleCancelOverrideOTP = () => {
    setShowOverrideOTP(false);
    setGeneratedOverrideOtp(null);
    toast("Override OTP cancelled");
  };

  const inputClasses = `
    w-full h-12 px-4 py-3
    border border-gray-300 rounded-lg
    bg-white text-gray-900 text-sm
    placeholder:text-gray-500
    cursor-pointer
    transition-all duration-200 ease-in-out
    hover:border-blue-400 hover:shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:border-gray-200 disabled:text-gray-500
  `;

  const labelClasses = `
    block text-sm font-semibold text-gray-700 mb-2
  `;

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

  const getMainButtonConfig = () => {
    if (!bookingCreated) {
      return {
        text: "Create Booking",
        disabled: isCreating,
        loading: isCreating,
        loadingText: "Creating...",
      };
    }

    if (isOverrideMode) {
      if (!overrideVerified) {
        return {
          text: "Request Override OTP",
          disabled: isOverrideRegistering,
          loading: isOverrideRegistering,
          loadingText: "Sending Override OTP...",
        };
      } else {
        return {
          text: "Complete Emergency Booking",
          disabled: false,
          loading: false,
          loadingText: "",
        };
      }
    } else {
      if (!patientConsentVerified) {
        return {
          text: "Verify OTP and Book",
          disabled: isPatientOtpRegistering,
          loading: isPatientOtpRegistering,
          loadingText: "Sending Patient OTP...",
        };
      } else {
        return {
          text: "Proceed to Next Step",
          disabled: false,
          loading: false,
          loadingText: "",
        };
      }
    }
  };

  const buttonConfig = getMainButtonConfig();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Patient OTP Modal */}
      {showPatientOTP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <OTPValidation
              title="Patient Consent OTP"
              description="Enter the OTP sent to the patient to verify their consent for this booking."
              onValidate={handleValidatePatientOTP}
              onCancel={handleCancelPatientOTP}
              processingLabel={
                isPatientOtpValidating
                  ? "Verifying..."
                  : "Verify Patient Consent"
              }
              initialOtp={generatedPatientOtp ?? ""}
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
              description="Enter the override OTP sent to the facility manager to approve this emergency booking."
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

      <form
        className="bg-white shadow-lg rounded-xl px-8 py-4 border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FaStethoscope className="text-blue-600" />
            Book a Service
          </h2>
        </div>

        {/* Booking Status Indicator */}
        {bookingCreated && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FaCheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Booking Created Successfully
              </span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Booking ID: {currentBookingId} -
              {isOverrideMode
                ? " Ready for emergency override verification"
                : " Ready for patient consent verification"}
            </p>
          </div>
        )}

        {/* Override Mode Indicator */}
        {isOverrideMode && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="w-5 h-5 text-amber-600 mr-2" />
              <span className="text-amber-800 font-medium">
                Emergency Override Mode Active
                {overrideVerified && (
                  <span className="ml-2 text-green-600 flex items-center">
                    <FaCheckCircle className="inline w-4 h-4 mr-1" /> Verified
                  </span>
                )}
              </span>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              This booking will bypass patient consent verification and require
              manager approval.
            </p>
          </div>
        )}

        {/* Patient Consent Status */}
        {!isOverrideMode && patientConsentVerified && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <FaUserCheck className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium flex items-center">
                Patient Consent Verified{" "}
                <FaCheckCircle className="inline w-4 h-4 ml-1" />
              </span>
            </div>
            <p className="text-blue-700 text-sm mt-1">
              Patient has successfully consented to this booking.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          {/* Patient Name */}
          <div className="space-y-2">
            <div className="relative">
              <label className={labelClasses}>
                <FaUserShield className="inline mr-1 text-blue-500" /> Patient
              </label>
              <Modal>
                <Modal.Open opens="patient-form">
                  <button
                    type="button"
                    className="
                      absolute right-1 top-1/2 -translate-y-1/2
                      flex items-center justify-center
                      w-6 h-6 rounded-full
                      bg-blue-500 hover:bg-blue-600
                      text-white font-bold text-sm
                      transition-colors duration-200
                      cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      z-10
                    "
                    title="Add new patient"
                  >
                    <FaUserPlus />
                  </button>
                </Modal.Open>
                <Modal.Window name="patient-form">
                  <PatientRegistration onPatientAdded={handleAddPatient} />
                </Modal.Window>
              </Modal>
            </div>
            <div>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className={inputClasses}
                required
                disabled={bookingCreated}
              >
                <option value="">Select a patient</option>
                {patients?.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.patientName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Category */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <FaStethoscope className="inline mr-1 text-green-600" />{" "}
              Diagnostic Service
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated}
            >
              <option value="">Select a category</option>
              {categories?.map((s) => (
                <option key={s.categoryId} value={s.categoryId}>
                  {s.lotNumber} - {s.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Facility */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <FaHospital className="inline mr-1 text-purple-600" /> Facility
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated}
            >
              <option value="">Select a facility</option>
              {facilities?.map((f) => (
                <option key={f.facilityId} value={f.facilityId}>
                  {f.facilityName}
                </option>
              ))}
            </select>
          </div>

          {/* Service Name */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <FaStethoscope className="inline mr-1 text-blue-600" /> Service
              Name
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated}
            >
              <option value="">Select a service</option>
              {services?.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.serviceName}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <FaMoneyBillWave className="inline mr-1 text-amber-600" /> Payment
              Mode
            </label>
            <select
              value={selectedPaymentModeId}
              onChange={(e) => setSelectedPaymentModeId(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated}
            >
              <option value="">Select payment mode</option>
              {paymentModes?.map((e) => (
                <option key={e.paymentModeId} value={e.paymentModeId}>
                  {e.paymentModeName}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment - COMMENTED OUT */}
          {/* <div className="space-y-2">
            <label className={labelClasses}>
              <FaTools className="inline mr-1 text-gray-600" /> Equipment
            </label>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated}
            >
              <option value="">Select equipment</option>
              {equipments?.map((e) => (
                <option key={e.equipmentId} value={e.equipmentId}>
                  {e.equipmentName}
                </option>
              ))}
            </select>
          </div> */}

          {/* Booking Date & Time */}
          <div className="space-y-2">
            <label className={labelClasses}>
              <FaCalendarAlt className="inline mr-1 text-pink-600" /> Booking
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className={inputClasses}
              required
              disabled={bookingCreated}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          {/* Emergency Override Toggle */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <FaExclamationTriangle className="mr-1 text-amber-500" />
              Emergency Override:
            </label>
            <button
              type="button"
              onClick={() => {
                if (bookingCreated) {
                  toast("Cannot change override mode after booking is created");
                  return;
                }
                setIsOverrideMode(!isOverrideMode);
                setOverrideVerified(false);
                setPatientConsentVerified(false);
                setGeneratedOverrideOtp(null);
                setGeneratedPatientOtp(null);
              }}
              disabled={bookingCreated}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                ${bookingCreated ? "opacity-50 cursor-not-allowed" : ""}
                ${isOverrideMode ? "bg-amber-500" : "bg-gray-200"}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white
                  transition-transform duration-200 ease-in-out
                  ${isOverrideMode ? "translate-x-6" : "translate-x-1"}
                `}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={buttonConfig.disabled}
              className={`
                ${buttonClasses}
                ${
                  isOverrideMode
                    ? "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 disabled:bg-amber-300"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400"
                }
                text-white
                disabled:text-gray-600
              `}
            >
              {buttonConfig.loading ? (
                <>
                  <FaSyncAlt className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" />
                  {buttonConfig.loadingText}
                </>
              ) : (
                buttonConfig.text
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BasicBookingStep;
