"use client";

import DiagnosticServices from "@/components/DiagnosticServices";

import PatientConsent from "@/features/patients/PatientConsent";
import PatientRegistration from "@/features/patients/PatientRegistration";
import FacilityReport from "@/features/reports/FacilityReport";
import ServiceBooking from "@/features/services/bookings/ServiceBooking";
import ServiceFulfillment from "@/features/services/fulfillments/ServiceFulfillment";
import ServiceRecommendation from "@/features/services/recommendations/ServiceRecommendation";
import { useAppSelector } from "@/hooks/hooks";

function Clinicians() {
  const { currentStep } = useAppSelector((store) => store.workflow);

  const renderStepComponent = () => {
    switch (currentStep) {
      case "registration":
        return <PatientRegistration />;
      case "recommendation":
        return <ServiceRecommendation />;
      case "booking":
        return <ServiceBooking />;
      case "consent":
        return <PatientConsent />;
      case "service":
        return <DiagnosticServices />;
      case "fulfillment":
        return <ServiceFulfillment />;
      case "report":
        return <FacilityReport />;
      default:
        return <div>Step not implemented.</div>;
    }
  };

  return <div className="max-w-4xl mx-auto mt-2">{renderStepComponent()}</div>;
}

export default Clinicians;
