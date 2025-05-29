"use client";

import BasicBookingStep from "@/components/BasicBooking";
import ServiceInProgress from "@/components/ServiceInProgress";
import PatientConsent from "@/features/patients/PatientConsent";
import ServiceFulfillment from "@/features/services/fulfillments/ServiceFulfillment";
import { useAppSelector } from "@/hooks/hooks";
import { useEffect } from "react";

function Clinicians() {
  const { currentStep } = useAppSelector((store) => store.workflow);

  useEffect(() => {
    console.log("Current workflow step:", currentStep);
  }, [currentStep]);

  const renderStepComponent = () => {
    switch (currentStep) {
      case "basicBooking":
        return <BasicBookingStep />;
      // case "registration":
      //   return <PatientRegistration />;
      // case "recommendation":
      //   return <ServiceRecommendation />;
      // case "booking":
      //   return <ServiceBooking />;
      case "consent":
        return <PatientConsent />;
      case "serviceInProgress":
        return <ServiceInProgress />;
      // case "serviceValidation":
      //   return <ServiceValidation />;
      case "fulfillment":
        return <ServiceFulfillment />;
      // case "report":
      //   return <FacilityReport />;
      default:
        return <div>Step not implemented.</div>;
    }
  };

  return <div className="max-w-4xl mx-auto mt-2">{renderStepComponent()}</div>;
}

export default Clinicians;
