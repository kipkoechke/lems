// src/store/workflowSlice.ts
import { Invoice, ValidationReport } from "@/lib/types";
import { IServiceBooking } from "@/services/apiBooking";
import { Equipment } from "@/services/apiEquipment";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import { ServiceInfo } from "@/services/apiServiceInfo";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WorkflowState {
  currentStep:
    | "registration"
    | "recommendation"
    | "booking"
    | "consent"
    | "service"
    | "fulfillment"
    | "report"
    | "validation"
    | "completion"
    | "invoice"
    | "approval"
    | "disbursement";
  patient?: Patient;
  selectedService?: ServiceInfo;
  selectedEquipment?: Equipment;
  selectedFacility?: Facility;
  booking?: IServiceBooking;
  consentObtained?: boolean;
  serviceValidated?: boolean;
  serviceCompleted?: boolean;
  invoice?: Invoice;
  validationReport?: ValidationReport;
  paymentApproved?: boolean;
  disbursementComplete?: boolean;
}

const initialState: WorkflowState = {
  currentStep: "registration",
};

// Update the step order to match our workflow
export const stepOrder: WorkflowState["currentStep"][] = [
  "registration",
  "recommendation",
  "booking",
  "consent",
  "fulfillment",
  "report",
  "completion",
  "invoice",
  "approval",
  "disbursement",
  "validation",
];

export const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<WorkflowState["currentStep"]>) => {
      state.currentStep = action.payload;
    },
    setPatient: (state, action: PayloadAction<Patient>) => {
      state.patient = action.payload;
    },
    selectService: (state, action: PayloadAction<ServiceInfo>) => {
      state.selectedService = action.payload;
    },
    selectEquipment: (state, action: PayloadAction<Equipment>) => {
      state.selectedEquipment = action.payload;
    },
    selectFacility: (state, action: PayloadAction<Facility>) => {
      state.selectedFacility = action.payload;
    },
    setConsent: (state, action: PayloadAction<boolean>) => {
      state.consentObtained = action.payload;
    },
    validateService: (state, action: PayloadAction<boolean>) => {
      state.serviceValidated = action.payload;
    },
    completeService: (state, action: PayloadAction<boolean>) => {
      state.serviceCompleted = action.payload;
    },
    setInvoice: (state, action: PayloadAction<Invoice>) => {
      state.invoice = action.payload;
    },
    setValidationReport: (state, action: PayloadAction<ValidationReport>) => {
      state.validationReport = action.payload;
    },
    approvePayment: (state, action: PayloadAction<boolean>) => {
      state.paymentApproved = action.payload;
    },
    completeDisbursement: (state, action: PayloadAction<boolean>) => {
      state.disbursementComplete = action.payload;
    },
    setBooking: (state, action: PayloadAction<IServiceBooking>) => {
      state.booking = action.payload;
    },
    resetWorkflow: () => initialState,
    goToNextStep: (state) => {
      const currentIndex = stepOrder.indexOf(state.currentStep);
      if (currentIndex < stepOrder.length - 1) {
        state.currentStep = stepOrder[currentIndex + 1];
      }
    },
    goToPreviousStep: (state) => {
      const currentIndex = stepOrder.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = stepOrder[currentIndex - 1];
      }
    },
  },
});

// Export actions and reducer
export const {
  setStep,
  setPatient,
  selectService,
  selectEquipment,
  selectFacility,
  setConsent,
  validateService,
  completeService,
  setInvoice,
  setValidationReport,
  approvePayment,
  completeDisbursement,
  setBooking,
  resetWorkflow,
  goToNextStep,
  goToPreviousStep,
} = workflowSlice.actions;

export default workflowSlice.reducer;
