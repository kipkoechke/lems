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

export interface Ward {
  id: string;
  code: string;
  name: string;
  sub_county_id: string;
}

export const getCounties = async (): Promise<County[]> => {
  const response = await axios.get("/places/counties");
  return response.data;
};

export const getSubCounties = async (
  county_code: string,
): Promise<SubCounty[]> => {
  const response = await axios.get(`/places/counties/${county_code}/sub-counties`);
  return response.data;
};

export const getWards = async (sub_county_code: string): Promise<Ward[]> => {
  const response = await axios.get(`/places/sub-counties/${sub_county_code}/wards`);
  return response.data;
};
