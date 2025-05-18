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
