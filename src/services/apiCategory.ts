import axios from "../lib/axios";

export interface ServiceCategory {
  categoryId: string;
  name: string;
  vendorId: string;
  vendorName: string;
  vendorContact: string;
  equipmentId: string;
  equipmentName: string;
}

export type ServiceCategoryForm = Omit<ServiceCategory, "categoryId">;

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await axios.get("/ServiceCategory");
  return response.data.data;
};

export const getServiceCategoryById = async (
  categoryId: string
): Promise<ServiceCategory> => {
  const response = await axios.get(`/ServiceCategory/${categoryId}`);
  return response.data.data;
};

export const createServiceCategory = async (
  data: ServiceCategoryForm
): Promise<ServiceCategory> => {
  const response = await axios.post("/ServiceCategory", data);
  return response.data.data;
};
