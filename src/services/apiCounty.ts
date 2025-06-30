import axios from "../lib/axios";

export interface County {
  id: string;
  code: string;
  name: string;
}

export interface SubCounty {
  id: string;
  code: string;
  name: string;
  county_id: string;
}

export type CountyForm = Omit<County, "id">;

export const getCounties = async (): Promise<County[]> => {
  const response = await axios.get("/places");
  return response.data;
};

export const getSubCounties = async (
  county_code: string
): Promise<SubCounty[]> => {
  const response = await axios.get(`/places?county_code=${county_code}`);
  return response.data;
};
