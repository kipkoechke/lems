import axios from "../lib/axios";

export interface Vendor {
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
  deleteddAt: string | null;
}

export interface VendorsResponse {
  data: Vendor[];
}

// Example fetcher function for vendors
export const getVendors = async (): Promise<Vendor[]> => {
  const response = await axios.get<VendorsResponse>("/vendors");
  return response.data.data;
};
