import axios from "../lib/axios";

export type VendorContactType =
  | "technical"
  | "support"
  | "finance"
  | "general";

export const VENDOR_CONTACT_TYPES: {
  value: VendorContactType;
  label: string;
}[] = [
  { value: "technical", label: "Technical" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "general", label: "General" },
];

export interface VendorContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  contact_type: VendorContactType;
  title?: string | null;
  department?: string | null;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorContactPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  contact_type: VendorContactType;
  title?: string;
  department?: string;
  is_primary?: boolean;
}

// GET /vendors/{vendor_id}/contacts
export const getVendorContacts = async (
  vendorId: string,
): Promise<VendorContact[]> => {
  const response = await axios.get<{ data: VendorContact[] }>(
    `/vendors/${vendorId}/contacts`,
  );
  return response.data.data ?? [];
};

// POST /vendors/{vendor_id}/contacts
export const createVendorContact = async (
  vendorId: string,
  data: VendorContactPayload,
): Promise<VendorContact> => {
  const response = await axios.post<{ data: VendorContact }>(
    `/vendors/${vendorId}/contacts`,
    data,
  );
  return response.data.data ?? (response.data as unknown as VendorContact);
};

// PUT /vendors/{vendor_id}/contacts/{contact_id}
export const updateVendorContact = async (
  vendorId: string,
  contactId: string,
  data: Partial<VendorContactPayload>,
): Promise<VendorContact> => {
  const response = await axios.put<{ data: VendorContact }>(
    `/vendors/${vendorId}/contacts/${contactId}`,
    data,
  );
  return response.data.data ?? (response.data as unknown as VendorContact);
};

// DELETE /vendors/{vendor_id}/contacts/{contact_id} — returns 204
export const deleteVendorContact = async (
  vendorId: string,
  contactId: string,
): Promise<void> => {
  await axios.delete(`/vendors/${vendorId}/contacts/${contactId}`);
};
