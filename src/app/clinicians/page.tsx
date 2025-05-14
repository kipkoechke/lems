"use client";

import DiagnosticServices from "@/components/new/DiagnosticServices";
import PatientConsent from "@/components/new/PatientConsent";
import PatientRegistration from "@/components/new/PatientRegistration";
import ServiceBooking from "@/components/new/ServiceBooking";
import ServiceRecommendation from "@/components/new/ServiceRecommendation";
import ServiceValidation from "@/components/new/ServiceValidation";
import { useWorkflow } from "@/context/WorkflowContext";

function Clinicians() {
  const { state, goToNextStep, goToPreviousStep } = useWorkflow();

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
      case "validation":
        return <ServiceValidation />;
      case "service":
        return <DiagnosticServices />;
      default:
        return <div>Step not implemented.</div>;
    }
  };

  return <div className="max-w-4xl mx-auto mt-2">{renderStepComponent()}</div>;
}

export default Clinicians;
