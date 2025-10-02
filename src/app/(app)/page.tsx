"use client";

import { RoleBasedDashboard } from "@/components/RoleBasedDashboard";
import UserInfo from "@/components/UserInfo";
import ProceedToTests from "@/components/ProceedToTests";
import ServiceInProgress from "@/components/ServiceInProgress";
import {
  goToNextStep,
  selectFacility,
  selectPaymentMode,
  setPatient,
} from "@/context/workflowSlice";
import PatientConsent from "@/features/patients/PatientConsent";
import PatientRegistration from "@/features/patients/PatientRegistration";
import ServiceFulfillment from "@/features/services/fulfillments/ServiceFulfillment";
import ServiceRecommendation from "@/features/services/recommendations/ServiceRecommendation";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import { useEffect } from "react";

function Clinicians() {
  const { currentStep } = useAppSelector((store) => store.workflow);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("Current workflow step:", currentStep);
  }, [currentStep]);

  // Handler for PatientRegistration step completion
  const handleStepOneComplete = (
    patient: Patient,
    paymentModeId: string,
    facility: Facility
  ) => {
    console.log("handleStepOneComplete called with:", {
      patient,
      paymentModeId,
      facility,
    });

    // Dispatch all the data to workflow state
    dispatch(setPatient(patient));

    // Create hardcoded payment mode object
    const paymentModeMap: Record<string, any> = {
      sha: { paymentModeId: "sha", paymentModeName: "SHA" },
      cash: { paymentModeId: "cash", paymentModeName: "CASH" },
      other_insurances: {
        paymentModeId: "other_insurances",
        paymentModeName: "OTHER INSURANCES",
      },
    };
    const paymentMode = paymentModeMap[paymentModeId];

    console.log("Dispatching:", { paymentMode, facility });

    dispatch(selectPaymentMode(paymentMode));
    dispatch(selectFacility(facility)); // This will now set state.facility
    dispatch(goToNextStep()); // This should now work to go to ServiceRecommendation
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case "registration":
        return (
          <PatientRegistration onStepOneComplete={handleStepOneComplete} />
        );
      case "recommendation":
        return <ServiceRecommendation />;
      case "consent":
        return <PatientConsent />;
      case "proceedToTests":
        return <ProceedToTests />;
      case "serviceInProgress":
        return <ServiceInProgress />;
      case "fulfillment":
        return <ServiceFulfillment />;
      default:
        return <div>Step not implemented.</div>;
    }
  };

  return (
    <div className="container mx-auto p-2 md:px-6 md:py-2">
      <UserInfo />
      <div className="mt-6">
        <RoleBasedDashboard />
      </div>
      <div className="mt-8">{renderStepComponent()}</div>
    </div>
  );
}

export default Clinicians;
