import axios from "../lib/axios";

const formatDateForApi = (date: Date) => date.toISOString();

export const getVendorsReport = async (startDate: Date, endDate: Date) => {
  const response = await axios.get("/Report/vendors", {
    params: {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    },
  });
  return response.data;
};
export const getVendorReport = async (
  vendorId: string,
  startDate: Date,
  endDate: Date
) => {
  const response = await axios.get(`/Report/vendors/${vendorId}`, {
    params: {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    },
  });
  return response.data;
};

export const getFacilitiesReport = async (startDate: Date, endDate: Date) => {
  const response = await axios.get("/Report/facilities", {
    params: {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    },
  });

  return response.data;
};

export const getFacilityReport = async (
  facilityId: string,
  startDate: Date,
  endDate: Date
) => {
  const response = await axios.get(`/Report/facilities/${facilityId}`, {
    params: {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    },
  });

  return response.data;
};

export const getFacilitiesSummaryReport = async (
  startDate: Date,
  endDate: Date
) => {
  const response = await axios.get("/Report/facilities/summary", {
    params: {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    },
  });

  return response.data;
};

export const getFacilityVendorReport = async (
  facilityId: string,
  vendorId: string,
  startDate: Date,
  endDate: Date
) => {
  const response = await axios.get(
    `/Report/facilities/${facilityId}/vendors/${vendorId}`,
    {
      params: {
        startDate: formatDateForApi(startDate),
        endDate: formatDateForApi(endDate),
      },
    }
  );
  return response.data;
};

export const getFacilityTrend = async (facilityId: string, year: number) => {
  const response = await axios.get(
    `/Report/facilities/${facilityId}/trend/${year}`
  );
  return response.data;
};
