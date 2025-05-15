import { IServiceBooking } from "@/services/apiBooking";
import { Equipment } from "@/services/apiEquipment";
import { Facility } from "@/services/apiFacility";
import { Patient } from "@/services/apiPatient";
import { ServiceInfo } from "@/services/apiServiceInfo";

export interface Clinician {
  clinicianID: string;
  name: string;
  specialty: string;
  mobileNumber: string;
}

export interface VendorEquipment {
  equipmentID: string;
  equipmentName: string;
  type: string;
  availabilityStatus: "Available" | "In Use" | "Maintenance";
  costPerSession: number;
}

export interface DiagnosticService {
  serviceID: string;
  serviceName?: string;
  equipmentID?: string;
  facilityCode?: string;
  cost: number;
  status: "Pending" | "Scheduled" | "Completed" | "Cancelled";
}

export interface Invoice {
  invoiceID: string;
  dateGenerated: string;
  totalCost: number;
  status: "Pending" | "Approved" | "Rejected" | "Paid";
  facilityID: string;
}

export interface ValidationReport {
  reportID: string;
  dateGenerated: string;
  details: string;
  status: "Pending" | "Approved" | "Rejected";
  linkedInvoiceID: string;
}

export interface PaymentDisbursement {
  disbursementID: string;
  totalAmount: number;
  facilityShare: number;
  vendorShare: number;
  status: "Pending" | "Completed" | "Failed";
}

export interface SMSNotification {
  notificationID: string;
  recipientContact: string;
  messageType: "OTP" | "Confirmation" | "Reminder";
  timestamp: string;
}

// States for workflow management
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

export interface ServiceRecommendation {
  serviceId: string;
  patientId: string;
  recommendedServices: DiagnosticService[];
  status: "Pending" | "Approved" | "Rejected";
}
