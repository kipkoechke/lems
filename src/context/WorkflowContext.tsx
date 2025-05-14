"use client";
import { IServiceBooking } from "@/services/apiBooking";
import { Patient } from "@/services/apiPatient";
import { ServiceInfo } from "@/services/apiServiceInfo";
import React, { createContext, ReactNode, useContext, useReducer } from "react";
import { Invoice, ValidationReport, WorkflowState } from "./../lib/types";
import { Equipment } from "@/services/apiEquipment";
import { Facility } from "@/services/apiFacility";

// Update WorkflowState to include equipment and facility
type WorkflowAction =
  | { type: "SET_STEP"; payload: WorkflowState["currentStep"] }
  | { type: "SET_PATIENT"; payload: Patient }
  | { type: "SELECT_SERVICE"; payload: ServiceInfo }
  | { type: "SELECT_EQUIPMENT"; payload: Equipment }
  | { type: "SELECT_FACILITY"; payload: Facility }
  | { type: "SET_CONSENT"; payload: boolean }
  | { type: "VALIDATE_SERVICE"; payload: boolean }
  | { type: "COMPLETE_SERVICE"; payload: boolean }
  | { type: "SET_INVOICE"; payload: Invoice }
  | { type: "SET_VALIDATION_REPORT"; payload: ValidationReport }
  | { type: "APPROVE_PAYMENT"; payload: boolean }
  | { type: "COMPLETE_DISBURSEMENT"; payload: boolean }
  | { type: "RESET_WORKFLOW" }
  | { type: "SET_BOOKING"; payload: IServiceBooking };

const initialState: WorkflowState = {
  currentStep: "registration",
};

const workflowReducer = (
  state: WorkflowState,
  action: WorkflowAction
): WorkflowState => {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload };
    case "SET_PATIENT":
      return { ...state, patient: action.payload };
    case "SELECT_SERVICE":
      return { ...state, selectedService: action.payload };
    case "SELECT_EQUIPMENT":
      return { ...state, selectedEquipment: action.payload };
    case "SELECT_FACILITY":
      return { ...state, selectedFacility: action.payload };
    case "SET_CONSENT":
      return { ...state, consentObtained: action.payload };
    case "VALIDATE_SERVICE":
      return { ...state, serviceValidated: action.payload };
    case "COMPLETE_SERVICE":
      return { ...state, serviceCompleted: action.payload };
    case "SET_INVOICE":
      return { ...state, invoice: action.payload };
    case "SET_VALIDATION_REPORT":
      return { ...state, validationReport: action.payload };
    case "APPROVE_PAYMENT":
      return { ...state, paymentApproved: action.payload };
    case "COMPLETE_DISBURSEMENT":
      return { ...state, disbursementComplete: action.payload };
    case "SET_BOOKING":
      return { ...state, booking: action.payload };
    case "RESET_WORKFLOW":
      return initialState;
    default:
      return state;
  }
};

interface WorkflowContextType {
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

interface WorkflowProviderProps {
  children: ReactNode;
}

const stepOrder: WorkflowState["currentStep"][] = [
  "registration",
  "recommendation",
  "booking",
  "consent",
  "validation",
  "service",
  "completion",
  "invoice",
  "approval",
  "disbursement",
];

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      dispatch({
        type: "SET_STEP",
        payload: stepOrder[currentIndex + 1],
      });
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      dispatch({
        type: "SET_STEP",
        payload: stepOrder[currentIndex - 1],
      });
    }
  };

  return (
    <WorkflowContext.Provider
      value={{ state, dispatch, goToNextStep, goToPreviousStep }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  }
  return context;
};
