import axios from "../lib/axios";

export interface ServiceCategory {
  categoryId: string;
  lotNumber: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ServiceCategoryForm = Omit<ServiceCategory, "categoryId">;

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await axios.get("/categories");
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
