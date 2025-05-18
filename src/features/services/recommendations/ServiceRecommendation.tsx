"use client";

import {
  goToNextStep,
  goToPreviousStep,
  selectEquipment,
  selectFacility,
  selectService,
} from "@/context/workflowSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import React, { useState } from "react";
import { useEquipments } from "../../equipments/useEquipments";
import { useFacilities } from "../../facilities/useFacilities";
import { useServiceInfos } from "../useServiceInfo";

const ServiceRecommendation: React.FC = () => {
  const { patient } = useAppSelector((store) => store.workflow);
  const dispatch = useAppDispatch();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null
  );
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(
    null
  );

  // Fetch data using React Query hooks
  const { isLoading: loadingServices, serviceInfos } = useServiceInfos();
  const { isLoading: loadingEquipments, equipments } = useEquipments();
  const { isLoading: loadingFacilities, facilities } = useFacilities();

  const handleContinue = () => {
    if (selectedServiceId && selectedEquipmentId && selectedFacilityId) {
      const selectedService = serviceInfos?.find(
        (service) => service.serviceId === selectedServiceId
      );
      const selectedEquipment = equipments?.find(
        (equipment) => equipment.equipmentId === selectedEquipmentId
      );
      const selectedFacility = facilities?.find(
        (facility) => facility.facilityId === selectedFacilityId
      );

      if (selectedService) {
        dispatch(selectService({ ...selectedService }));

        if (selectedEquipment) {
          dispatch(selectEquipment({ ...selectedEquipment }));
        }

        if (selectedFacility) {
          dispatch(selectFacility({ ...selectedFacility }));
        }

        dispatch(goToNextStep());
      }
    }
  };

  if (loadingServices || loadingEquipments || loadingFacilities) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-24 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Clinician Diagnostic Test Recommendation
        </h2>
        <div>
          <span className="text-gray-600 mr-2">Patient:</span>
          <span className="font-medium">{patient?.patientName}</span>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-blue-800 mb-2">
          Clinician Recommendation
        </h3>
        <p className="text-blue-700">
          Based on the patient&apos;s condition, please select a service,
          equipment, and facility to proceed with booking.
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="serviceId"
          className="block text-gray-700 font-medium mb-2"
        >
          Select Service
        </label>
        <select
          id="serviceId"
          value={selectedServiceId || ""}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select a service
          </option>
          {serviceInfos?.map((service) => (
            <option key={service.serviceId} value={service.serviceId}>
              {service.description} - Ksh
              {service.facilityShare.toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="equipmentId"
          className="block text-gray-700 font-medium mb-2"
        >
          Select Equipment
        </label>
        <select
          id="equipmentId"
          value={selectedEquipmentId || ""}
          onChange={(e) => setSelectedEquipmentId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select equipment
          </option>
          {equipments?.map((equipment) => (
            <option key={equipment.equipmentId} value={equipment.equipmentId}>
              {equipment.equipmentName}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label
          htmlFor="facilityId"
          className="block text-gray-700 font-medium mb-2"
        >
          Select Facility
        </label>
        <select
          id="facilityId"
          value={selectedFacilityId || ""}
          onChange={(e) => setSelectedFacilityId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select a facility
          </option>
          {facilities?.map((facility) => (
            <option key={facility.facilityId} value={facility.facilityId}>
              {facility.facilityName} - {facility.county}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => dispatch(goToPreviousStep())}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={
            !selectedServiceId || !selectedEquipmentId || !selectedFacilityId
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          Continue to Booking
        </button>
      </div>
    </div>
  );
};

export default ServiceRecommendation;
