import {
  selectEquipment,
  selectFacility,
  selectPaymentMode,
  selectService,
  setPatient,
} from "@/context/workflowSlice";
import { useEquipments } from "@/features/equipments/useEquipments";
import { useFacilities } from "@/features/facilities/useFacilities";
import PatientRegistration from "@/features/patients/PatientRegistration";
import { usePatients } from "@/features/patients/usePatients";
import { usePaymentModes } from "@/features/paymentModes/usePaymentModes";
import { useCreateBooking } from "@/features/services/bookings/useCreateBooking";
import { useServiceInfos } from "@/features/services/useServiceInfo";
import { useAppDispatch } from "@/hooks/hooks";
import { Patient } from "@/services/apiPatient";
import React, { useState } from "react";
import Modal from "./Modal";

const BasicBookingStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = usePatients();
  const { serviceInfos } = useServiceInfos();
  const { equipments } = useEquipments();
  const { facilities } = useFacilities();
  const { paymentModes } = usePaymentModes();
  const { createBooking, isCreating } = useCreateBooking();

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
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
    const service = serviceInfos?.find(
      (s) => s.serviceId === selectedServiceId
    );
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
      service &&
      equipment &&
      facility &&
      paymentMode &&
      bookingDate
    ) {
      dispatch(setPatient(patient));
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

  return (
    <form
      className="bg-white shadow-2xs rounded-lg p-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
      <p className="mb-4 text-gray-600">
        Please fill in the form below to proceed
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-medium">Patient Name</label>
            <Modal>
              <Modal.Open opens="patient-form">
                <button
                  type="button"
                  className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
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
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">e.g. John Doe</option>
            {patients?.map((p) => (
              <option key={p.patientId} value={p.patientId}>
                {p.patientName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Service Name</label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">e.g. X-Ray</option>
            {serviceInfos?.map((s) => (
              <option key={s.serviceId} value={s.serviceId}>
                {s.description}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Equipment</label>
          <select
            value={selectedEquipmentId}
            onChange={(e) => setSelectedEquipmentId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">e.g. X-Ray Scanner</option>
            {equipments?.map((e) => (
              <option key={e.equipmentId} value={e.equipmentId}>
                {e.equipmentName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Facility</label>
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Facility</option>
            {facilities?.map((f) => (
              <option key={f.facilityId} value={f.facilityId}>
                {f.facilityName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Payment Mode</label>
          <select
            value={selectedPaymentModeId}
            onChange={(e) => setSelectedPaymentModeId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">e.g. SHA</option>
            {paymentModes?.map((e) => (
              <option key={e.paymentModeId} value={e.paymentModeId}>
                {e.paymentModeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Booking Date & Time</label>
          <input
            type="datetime-local"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full md:w-auto"
          disabled={isCreating}
        >
          Next
        </button>
      </div>
    </form>
  );
};

export default BasicBookingStep;
