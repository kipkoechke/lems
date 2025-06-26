import { useAppSelector } from "./hooks";

export interface WorkflowProgress {
  currentStep: string;
  completedSteps: string[];
  progress: {
    registration: number;
    service: number;
    fulfillment: number;
    overall: number;
  };
}

export const useWorkflowProgress = (): WorkflowProgress => {
  const {
    currentStep,
    patient,
    selectedService,
    booking,
    consentObtained,
    selectedFacility: facility,
    selectedPaymentMode: paymentMode,
  } = useAppSelector((store) => store.workflow);

  const getCompletedSteps = (): string[] => {
    const completed: string[] = [];

    // Registration steps
    if (facility) completed.push("facility");
    if (patient) completed.push("patient");
    if (paymentMode) completed.push("payment");

    // Service steps
    if (selectedService) completed.push("recommendation");
    if (booking) completed.push("booking");
    if (consentObtained) completed.push("consent");

    // Fulfillment steps - these would be tracked based on your workflow state
    if (
      currentStep === "proceedToTests" ||
      currentStep === "serviceInProgress" ||
      currentStep === "fulfillment"
    ) {
      completed.push("proceedToTests");
    }

    if (currentStep === "serviceInProgress" || currentStep === "fulfillment") {
      completed.push("serviceInProgress");
    }

    if (currentStep === "fulfillment") {
      completed.push("fulfillment");
    }

    return completed;
  };

  const completedSteps = getCompletedSteps();

  const calculateProgress = () => {
    const registrationSteps = ["facility", "patient", "payment"];
    const serviceSteps = ["recommendation", "booking", "consent"];
    const fulfillmentSteps = [
      "proceedToTests",
      "serviceInProgress",
      "fulfillment",
    ];
    const allSteps = [
      ...registrationSteps,
      ...serviceSteps,
      ...fulfillmentSteps,
    ];

    const registrationProgress =
      (completedSteps.filter((step) => registrationSteps.includes(step))
        .length /
        registrationSteps.length) *
      100;

    const serviceProgress =
      (completedSteps.filter((step) => serviceSteps.includes(step)).length /
        serviceSteps.length) *
      100;

    const fulfillmentProgress =
      (completedSteps.filter((step) => fulfillmentSteps.includes(step)).length /
        fulfillmentSteps.length) *
      100;

    const overallProgress = (completedSteps.length / allSteps.length) * 100;

    return {
      registration: Math.round(registrationProgress),
      service: Math.round(serviceProgress),
      fulfillment: Math.round(fulfillmentProgress),
      overall: Math.round(overallProgress),
    };
  };

  return {
    currentStep,
    completedSteps,
    progress: calculateProgress(),
  };
};
