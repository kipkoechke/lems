export interface Invoice {
  invoiceID: string;
  dateGenerated: string;
  totalCost: number;
  status: "Pending" | "Approved" | "Rejected" | "Paid";
  id: string;
}

export interface ValidationReport {
  reportID: string;
  dateGenerated: string;
  details: string;
  status: "Pending" | "Approved" | "Rejected";
  linkedInvoiceID: string;
}
