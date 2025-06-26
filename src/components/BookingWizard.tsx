import {
  selectCategory,
  selectFacility,
  selectPaymentMode,
  selectService,
  setBooking,
  setPatient,
} from "@/context/workflowSlice";
import { useFacilities } from "@/features/facilities/useFacilities";
import PatientRegistration from "@/features/patients/PatientRegistration";
import { usePatients } from "@/features/patients/usePatients";
import { usePaymentModes } from "@/features/paymentModes/usePaymentModes";
import { useCreateBooking } from "@/features/services/bookings/useCreateBooking";
import { useCategories } from "@/features/services/categories/useCategories";
import { useServiceByCategory } from "@/features/services/useServiceByCategory";
import { useAppDispatch } from "@/hooks/hooks";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";

const steps = [
  "Patient Registration",
  "Payment Information",
  "Booking Details",
];

const BookingWizard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);

  // Patient
  const { patients } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  // Payment
  const { paymentModes } = usePaymentModes();
  const [selectedPaymentModeId, setSelectedPaymentModeId] =
    useState<string>("");

  // Booking
  const { facilities } = useFacilities();
  const { categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const { services } = useServiceByCategory(selectedCategoryId);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");

  const { createBooking, isCreating } = useCreateBooking();

  // Stepper UI
  const Stepper = () => (
    <div className="flex items-center mb-8">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div
            className={`rounded-full w-8 h-8 flex items-center justify-center font-bold ${
              idx === step
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {idx + 1}
          </div>
          <span className="ml-2 mr-4">{label}</span>
          {idx < steps.length - 1 && (
            <span className="w-8 h-1 bg-gray-300 mx-2 rounded"></span>
          )}
        </div>
      ))}
    </div>
  );

  // Handlers
  const handlePatientAdded = (newPatient: any) => {
    setSelectedPatientId(newPatient.id);
    dispatch(setPatient(newPatient));
    setStep(1);
  };

  const handleNextFromPatient = () => {
    if (!selectedPatientId) {
      toast.error("Please select or register a patient.");
      return;
    }
    setStep(1);
  };

  const handleNextFromPayment = () => {
    if (!selectedPaymentModeId) {
      toast.error("Please select a payment mode.");
      return;
    }
    setStep(2);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields
    if (
      !selectedPatientId ||
      !selectedCategoryId ||
      !selectedServiceId ||
      !selectedFacilityId ||
      !selectedPaymentModeId ||
      !bookingDate
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Find objects
    const patient = patients?.find((p) => p.id === selectedPatientId);
    const category = categories?.find((c) => c.id === selectedCategoryId);
    const service = services?.find((s) => s.serviceId === selectedServiceId);
    const facility = facilities?.find((f) => f.id === selectedFacilityId);
    const paymentMode = paymentModes?.find(
      (pm) => pm.paymentModeId === selectedPaymentModeId
    );

    // Ensure all required objects are found
    if (!patient || !category || !service || !facility || !paymentMode) {
      toast.error("Please ensure all selections are valid.");
      return;
    }

    // Dispatch to workflow (optional, for global state)
    dispatch(setPatient(patient));
    dispatch(selectCategory(category));
    dispatch(selectService(service));
    dispatch(selectFacility(facility));
    dispatch(selectPaymentMode(paymentMode));

    // Create booking
    createBooking(
      {
        patient_id: patient.id,
        service_id: service.serviceId,
        facility_id: facility.id,
        booking_date: new Date(bookingDate),
        payment_mode_id: paymentMode.paymentModeId,
        status: "pending",
        notes: "",
        otp_overriden: false,
        cost: service.shaRate,
      },
      {
        onSuccess: (bookingData) => {
          toast.success("Booking created successfully!");
          dispatch(setBooking(bookingData));
          setStep(3);
        },
        onError: () => {
          toast.error("Failed to create booking");
        },
      }
    );
  };

  // UI for each step
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <Stepper />
      {step === 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Patient Registration</h2>
          <div className="mb-4">
            <Modal>
              <Modal.Open opens="patient-form">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Register New Patient
                </button>
              </Modal.Open>
              <Modal.Window name="patient-form">
                <PatientRegistration
                  onStepOneComplete={(patient, paymentModeId) =>
                    handlePatientAdded(patient)
                  }
                />
              </Modal.Window>
            </Modal>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Select Existing Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-3 border rounded"
            >
              <option value="">Select a patient</option>
              {patients?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded"
              onClick={handleNextFromPatient}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Select Payment Mode
            </label>
            <select
              value={selectedPaymentModeId}
              onChange={(e) => setSelectedPaymentModeId(e.target.value)}
              className="w-full p-3 border rounded"
            >
              <option value="">Select payment mode</option>
              {paymentModes?.map((pm) => (
                <option key={pm.paymentModeId} value={pm.paymentModeId}>
                  {pm.paymentModeName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between">
            <button
              className="px-6 py-2 bg-gray-200 rounded"
              onClick={() => setStep(0)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded"
              onClick={handleNextFromPayment}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleBookingSubmit}>
          <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Service Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full p-3 border rounded"
              required
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.number} - {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Service Name</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full p-3 border rounded"
              required
            >
              <option value="">Select a service</option>
              {services?.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.serviceName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Facility</label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full p-3 border rounded"
              required
            >
              <option value="">Select a facility</option>
              {facilities?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Booking Date & Time
            </label>
            <input
              type="datetime-local"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full p-3 border rounded"
              required
            />
          </div>
          <div className="flex justify-between">
            <button
              className="px-6 py-2 bg-gray-200 rounded"
              type="button"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 bg-green-600 text-white rounded"
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? "Booking..." : "Submit Booking"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Booking Created Successfully!
          </h2>
          <p className="text-gray-700 mb-6">
            The patient has been registered, payment information captured, and
            booking completed.
          </p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded"
            onClick={() => setStep(0)}
          >
            Book Another
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingWizard;
