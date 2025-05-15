"use client";

import FacilityReport from "@/components/new/FacilityReport";
import PatientConsent from "@/components/new/PatientConsent";
import PatientRegistration from "@/components/new/PatientRegistration";
import ServiceBooking from "@/components/new/ServiceBooking";
import ServiceFulfillment from "@/components/new/ServiceFulfillment";
import ServiceRecommendation from "@/components/new/ServiceRecommendation";
import { useWorkflow } from "@/context/WorkflowContext";

function Clinicians() {
  const { state } = useWorkflow();

  const renderStepComponent = () => {
    switch (state.currentStep) {
      case "registration":
        return <PatientRegistration />;
      case "recommendation":
        return <ServiceRecommendation />;
      case "booking":
        return <ServiceBooking />;
      case "consent":
        return <PatientConsent />;
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
