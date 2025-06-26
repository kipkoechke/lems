import axios from "../lib/axios";

export interface PaymentMode {
  paymentModeId: string;
  paymentModeName: string;
}

export type PaymentModeForm = {
  name: string;
};

export const registerPaymentModes = async (
  data: PaymentModeForm
): Promise<PaymentMode> => {
  const response = await axios.post("/create-payment-mode", data);
  return response.data.paymentMode;
};

export const getPaymentModes = async (): Promise<PaymentMode[]> => {
  const response = await axios.get("/payment-modes");
  return response.data.data;
};

export const getPaymentModeById = async (id: string): Promise<PaymentMode> => {
  const response = await axios.get(`/patient/${id}`);
  return response.data.data;
};

export const updatePatient = async (
  id: string,
  data: Partial<PaymentMode>
): Promise<PaymentMode> => {
  const response = await axios.patch(`/Patient/${id}`, data);
  return response.data.data;
};

export const deletePatient = async (id: string): Promise<void> => {
  await axios.delete<void>(`/Patient/${id}`);
};
