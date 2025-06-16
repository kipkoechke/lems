import axios from "../lib/axios";

export interface County {
  id: string;
  code: string;
  name: string;
}

export type CountyForm = Omit<County, "id">;

export const getCounties = async (): Promise<County[]> => {
  const response = await axios.get("/places/counties");
  return response.data.data;
};
