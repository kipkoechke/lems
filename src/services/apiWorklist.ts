import axiosInstance from "@/lib/axios";
import type { WorklistResponse, WorklistParams } from "@/types/worklist";

// GET practitioner worklist
export const getPractitionerWorklist = async (
  params: WorklistParams = {}
): Promise<WorklistResponse> => {
  const response = await axiosInstance.get("/practitioner/worklist", { params });
  return response.data;
};
