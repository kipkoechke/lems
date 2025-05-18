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
  const response = await axios.get<ServiceCategory[]>("/ServiceCategory");
  return response.data;
};

export const getServiceCategoryById = async (
  categoryId: string
): Promise<ServiceCategory> => {
  const response = await axios.get<ServiceCategory>(
    `/ServiceCategory/${categoryId}`
  );
  return response.data;
};

export const createServiceCategory = async (
  data: ServiceCategoryForm
): Promise<ServiceCategory> => {
  const response = await axios.post<ServiceCategory>("/ServiceCategory", data);
  return response.data;
};
