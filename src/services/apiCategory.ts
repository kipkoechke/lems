import axios from "../lib/axios";

export interface ServiceCategory {
  id: string;
  number: string;
  name: string;
  is_active: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Legacy interface for backward compatibility
export interface LegacyServiceCategory {
  id: string;
  number: string;
  name: string;
  created_at: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ServiceCategoryForm = Omit<ServiceCategory, "id">;

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
  const response = await axios.get("/lots");
  return response.data.lots;
};

export const getServiceCategoryById = async (
  id: string
): Promise<ServiceCategory> => {
  const response = await axios.get(`/ServiceCategory/${id}`);
  return response.data.data;
};

export const createServiceCategory = async (
  data: ServiceCategoryForm
): Promise<ServiceCategory> => {
  const response = await axios.post("/ServiceCategory", data);
  return response.data.data;
};
