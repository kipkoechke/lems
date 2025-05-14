"use client";

import { useWorkflow } from "@/context/WorkflowContext";
import { ServiceBookingForm } from "@/services/apiBooking";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import StatusCard from "./StatusCard";
import { useCreateBooking } from "./useCreateBooking";

const ServiceBooking: React.FC = () => {
  const { state, goToPreviousStep } = useWorkflow();
  const { createBooking, isCreating } = useCreateBooking();
  const [bookingComplete, setBookingComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceBookingForm>();

  // Get current date for min date value
  const today = new Date().toISOString().split("T")[0];

  // Simulate available time slots
  const availableTimeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  // Calculate end time (30 minutes after start time)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    let newHours = hours;
    let newMinutes = minutes + 30;

    if (newMinutes >= 60) {
      newHours += 1;
      newMinutes -= 60;
    }

    return `${newHours.toString().padStart(2, "0")}:${newMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const onSubmit = (data: ServiceBookingForm) => {
    if (
      !state.selectedService ||
      !state.patient ||
      !state.selectedEquipment ||
      !state.selectedFacility
    ) {
      return;
    }

    const bookingData: ServiceBookingForm = {
      patientId: state.patient.patientId,
      serviceId: state.selectedService.serviceId,
      equipmentId: state.selectedEquipment.equipmentId,
      facilityId: state.selectedFacility.facilityId,
      bookingDate: new Date(data.bookingDate),
      startTime: data.startTime,
      endTime: calculateEndTime(data.startTime),
      status: "Pending",
      notes: data.notes || "",
      cost: state.selectedService.shaRate,
    };
    console.log("Booking Data:", bookingData);

    createBooking(bookingData);
    setBookingComplete(true);
  };

  if (!state.selectedService) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusCard
          title="No Service Selected"
          status="error"
          message="No diagnostic service has been selected."
          details="Please go back and select a service to continue."
        />
        <div className="mt-4">
          <button
            onClick={goToPreviousStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Service Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Service Booking</h2>
        <div>
          <span className="text-gray-600 mr-2">Patient:</span>
          <span className="font-medium">{state.patient?.patientName}</span>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Selected Service Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Service Name</p>
            <p className="font-medium">{state.selectedService.description}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Service ID</p>
            <p className="font-medium">{state.selectedService.serviceId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Equipment</p>
            <p className="font-medium">
              {state.selectedEquipment?.equipmentName || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Facility</p>
            <p className="font-medium">
              {state.selectedFacility?.facilityName || "Not specified"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Cost</p>
            <p className="font-medium text-lg">
              Ksh{state.selectedService.shaRate.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Schedule Appointment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="bookingDate"
              className="block text-gray-700 font-medium mb-2"
            >
              Appointment Date
            </label>
            <input
              {...register("bookingDate", {
                required: "Appointment date is required",
              })}
              id="bookingDate"
              type="date"
              min={today}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.bookingDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.bookingDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="startTime"
              className="block text-gray-700 font-medium mb-2"
            >
              Appointment Time
            </label>
            <select
              {...register("startTime", {
                required: "Appointment time is required",
              })}
              id="startTime"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select time slot</option>
              {availableTimeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startTime.message}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="notes"
            className="block text-gray-700 font-medium mb-2"
          >
            Special Instructions (Optional)
          </label>
          <textarea
            {...register("notes")}
            id="notes"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter any special instructions or requirements"
          ></textarea>
        </div>

        {/* Hidden fields */}
        <input type="hidden" {...register("patientId")} />
        <input type="hidden" {...register("serviceId")} />
        <input type="hidden" {...register("equipmentId")} />
        <input type="hidden" {...register("facilityId")} />
        <input type="hidden" {...register("endTime")} />
        <input type="hidden" {...register("status")} />
        <input type="hidden" {...register("cost")} />

        <div className="flex justify-between">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isCreating ? "Processing..." : "Book Service"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceBooking;
