"use client";

import { Patient, PatientRegistrationForm } from "@/services/apiPatient";
import React from "react";
import { useForm } from "react-hook-form";
import { useRegisterPatient } from "./useRegisterPatient";

interface PatientRegistrationProps {
  onPatientAdded?: (patient: Patient) => void;
  onCloseModal?: () => void;
}

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  onPatientAdded,
  onCloseModal,
}) => {
  const { registerPatients, isRegistering } = useRegisterPatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientRegistrationForm>();

  const onSubmit = (data: PatientRegistrationForm) => {
    registerPatients(data, {
      onSuccess: (newPatient: Patient) => {
        if (onPatientAdded) onPatientAdded(newPatient);
        reset();
        onCloseModal?.();
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Patient Registration</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Full Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              id="name"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="mobileNumber"
              className="block text-gray-700 font-medium mb-2"
            >
              Contact Number
            </label>
            <input
              {...register("phone", {
                required: "Contact number is required",
                pattern: {
                  value: /^\d{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              })}
              id="phone"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10-digit phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="date_of_birth"
              className="block text-gray-700 font-medium mb-2"
            >
              Date of Birth
            </label>
            <input
              {...register("date_of_birth", {
                required: "Date of birth is required",
              })}
              id="date_of_birth"
              type="date"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date_of_birth && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          {/* <div className="mb-4">
            <label
              htmlFor="paymentMode"
              className="block text-gray-700 font-medium mb-2"
            >
              Payment Mode
            </label>
            <select
              {...register("paymentMode", {
                required: "Payment mode is required",
              })}
              id="paymentMode"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select payment mode</option>
              <option value="Cash">Cash</option>
              <option value="SHA">SHA</option>
              <option value="Insurance">Insurance</option>
            </select>
            {errors.paymentMode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.paymentMode.message}
              </p>
            )}
          </div> */}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isRegistering}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isRegistering ? "Registering..." : "Register Patient"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
