// src/store/workflowSlice.ts
import { Invoice, ValidationReport } from "@/lib/types";
import { Bookings } from "@/services/apiBooking";
import { ServiceCategory } from "@/services/apiCategory";
import { EquipmentWithService } from "@/services/apiEquipment";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import { PaymentMode } from "@/services/apiPaymentMode";
import { ServiceWithCategory } from "@/services/apiServices";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WorkflowState {
  currentStep: // | "basicBooking"
  | "registration"
    | "recommendation"
    | "consent"
    | "proceedToTests"
    | "serviceInProgress"
    // | "serviceValidation"
    | "service"
    | "fulfillment"
    // | "report"
    | "validation"
    | "completion"
    | "invoice"
    | "approval"
    | "disbursement";
  patient?: Patient;
  selectedCategory?: ServiceCategory;
  selectedService?: ServiceWithCategory;
  selectedEquipment?: EquipmentWithService;
  selectedFacility?: Facility;
  selectedPaymentMode?: PaymentMode;
  booking?: Bookings;
  otp_code?: string; // OTP from booking creation
  consentObtained?: boolean;
  serviceValidated?: boolean;
  serviceCompleted?: boolean;
  invoice?: Invoice;
  validationReport?: ValidationReport;
  paymentApproved?: boolean;
  disbursementComplete?: boolean;
  // Service recommendation state
  selectedContractId?: string;
  selectedServiceIds?: string[];
  serviceDates?: { [serviceId: string]: string };
  isOverrideMode?: boolean;
}

const initialState: WorkflowState = {
  currentStep: "registration",
};

// Update the step order to match our workflow
export const stepOrder: WorkflowState["currentStep"][] = [
  // "basicBooking",
  "registration",
  "recommendation",
  "consent",
  "proceedToTests",
  "serviceInProgress",
  // "serviceValidation",
  "fulfillment",
  // "report",
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
    selectCategory: (state, action: PayloadAction<ServiceCategory>) => {
      state.selectedCategory = action.payload;
    },
    selectService: (state, action: PayloadAction<ServiceWithCategory>) => {
      state.selectedService = action.payload;
    },
    selectEquipment: (state, action: PayloadAction<EquipmentWithService>) => {
      state.selectedEquipment = action.payload;
    },
    selectFacility: (state, action: PayloadAction<Facility>) => {
      state.selectedFacility = action.payload;
    },
    selectPaymentMode: (state, action: PayloadAction<PaymentMode>) => {
      state.selectedPaymentMode = action.payload;
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
    setBooking: (state, action: PayloadAction<Bookings>) => {
      state.booking = action.payload;
    },
    setOtpCode: (state, action: PayloadAction<string>) => {
      state.otp_code = action.payload;
    },
    setSelectedContract: (state, action: PayloadAction<string>) => {
      state.selectedContractId = action.payload;
    },
    setSelectedServices: (state, action: PayloadAction<string[]>) => {
      state.selectedServiceIds = action.payload;
    },
    setServiceDate: (state, action: PayloadAction<{ serviceId: string; date: string }>) => {
      if (!state.serviceDates) {
        state.serviceDates = {};
      }
      state.serviceDates[action.payload.serviceId] = action.payload.date;
    },
    setOverrideMode: (state, action: PayloadAction<boolean>) => {
      state.isOverrideMode = action.payload;
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
  selectCategory,
  selectService,
  selectEquipment,
  selectFacility,
  selectPaymentMode,
  setConsent,
  validateService,
  completeService,
  setInvoice,
  setValidationReport,
  approvePayment,
  completeDisbursement,
  setBooking,
  setOtpCode,
  setSelectedContract,
  setSelectedServices,
  setServiceDate,
  setOverrideMode,
  resetWorkflow,
  goToNextStep,
  goToPreviousStep,
} = workflowSlice.actions;

export default workflowSlice.reducer;
