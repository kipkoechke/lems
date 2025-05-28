import {
  selectCategory,
  selectEquipment,
  selectFacility,
  selectPaymentMode,
  selectService,
  setPatient,
} from "@/context/workflowSlice";
import { useEquipmentByService } from "@/features/equipments/userServiceEquipment";
import { useFacilities } from "@/features/facilities/useFacilities";
import PatientRegistration from "@/features/patients/PatientRegistration";
import { usePatients } from "@/features/patients/usePatients";
import { usePaymentModes } from "@/features/paymentModes/usePaymentModes";
import { useCreateBooking } from "@/features/services/bookings/useCreateBooking";
import { useCategories } from "@/features/services/categories/useCategories";
import { useServiceByCategory } from "@/features/services/useServiceByCategory";
import { useAppDispatch } from "@/hooks/hooks";
import { Patient } from "@/services/apiPatient";
import React, { useState } from "react";
import Modal from "./Modal";

const BasicBookingStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = usePatients();
  // const { serviceInfos } = useServiceInfos();
  // const { equipments } = useEquipments();
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const { data: equipments, isLoading: isEquipmentsLoading } =
    useEquipmentByService(selectedServiceId);
  const { facilities } = useFacilities();
  const { paymentModes } = usePaymentModes();
  const { createBooking, isCreating } = useCreateBooking();
  const { isLoading, categories, error } = useCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { isPending, data: services } =
    useServiceByCategory(selectedCategoryId);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [selectedPaymentModeId, setSelectedPaymentModeId] =
    useState<string>("");
  const [bookingDate, setBookingDate] = useState<string>("");

  const handleAddPatient = (newPatient: Patient) => {
    setSelectedPatientId(newPatient.patientId);
    dispatch(setPatient(newPatient));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients?.find((p) => p.patientId === selectedPatientId);
    const category = categories?.find(
      (c) => c.categoryId === selectedCategoryId
    );
    const service = services?.find((s) => s.serviceId === selectedServiceId);

    const equipment = equipments?.find(
      (e) => e.equipmentId === selectedEquipmentId
    );
    const facility = facilities?.find(
      (f) => f.facilityId === selectedFacilityId
    );

    const paymentMode = paymentModes?.find(
      (pm) => pm.paymentModeId === selectedPaymentModeId
    );

    if (
      patient &&
      category &&
      service &&
      equipment &&
      facility &&
      paymentMode &&
      bookingDate
    ) {
      dispatch(setPatient(patient));
      dispatch(selectCategory(category));
      dispatch(selectService(service));
      dispatch(selectEquipment(equipment));
      dispatch(selectFacility(facility));
      dispatch(selectPaymentMode(paymentMode));
      createBooking({
        patient_id: patient.patientId,
        service_id: service.serviceId,
        equipment_id: equipment.equipmentId,
        facility_id: facility.facilityId,
        booking_date: new Date(bookingDate),
        payment_mode_id: paymentMode.paymentModeId,
        status: "Pending",
        notes: "",
        otp_overriden: false,
        cost: service.shaRate,
      });
      //   dispatch(goToNextStep());
    }
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

  return (
    <div className="max-w-4xl mx-auto">
      <form
        className="bg-white shadow-lg rounded-xl px-8 py-4 border border-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Book a Service
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          {/* Patient Name */}
          <div className="space-y-2">
            <div className="relative">
              <label className={labelClasses}>Patient</label>{" "}
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
                    +
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
              >
                <option value="">Select a patient (e.g. John Doe)</option>
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
            <label className={labelClasses}>Diagnostic Service</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Select a category (e.g. X-Ray)</option>
              {categories?.map((s) => (
                <option key={s.categoryId} value={s.categoryId}>
                  <span>
                    {s.lotNumber} - {s.categoryName}
                  </span>
                </option>
              ))}
            </select>
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <label className={labelClasses}>Equipment</label>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Select equipment (e.g. X-Ray Scanner)</option>
              {equipments?.map((e) => (
                <option key={e.equipmentId} value={e.equipmentId}>
                  {e.equipmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Service Name */}
          <div className="space-y-2">
            <label className={labelClasses}>Service Name</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Select a service (e.g. X-Ray)</option>
              {services?.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.serviceName}
                </option>
              ))}
            </select>
          </div>

          {/* Facility */}
          <div className="space-y-2">
            <label className={labelClasses}>Facility</label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Select a facility</option>
              {facilities?.map((f) => (
                <option key={f.facilityId} value={f.facilityId}>
                  {f.facilityName}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
            <label className={labelClasses}>Payment Mode</label>
            <select
              value={selectedPaymentModeId}
              onChange={(e) => setSelectedPaymentModeId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Select payment mode (e.g. SHA)</option>
              {paymentModes?.map((e) => (
                <option key={e.paymentModeId} value={e.paymentModeId}>
                  {e.paymentModeName}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Date & Time */}
          <div className="space-y-2">
            <label className={labelClasses}>Booking Date & Time</label>
            <input
              type="datetime-local"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isCreating}
            className="
              px-8 py-3 min-w-[120px]
              bg-blue-600 hover:bg-blue-700
              disabled:bg-gray-400 disabled:cursor-not-allowed
              text-white font-semibold text-sm
              rounded-lg shadow-sm
              transition-all duration-200
              cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              hover:shadow-md
              flex items-center justify-center
            "
          >
            {isCreating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Processing...
              </>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicBookingStep;
