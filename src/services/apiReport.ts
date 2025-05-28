import axios from "../lib/axios";

const formatDateForApi = (date: Date) => date.toISOString();

export interface IFacilityReport {
  facility: string;
  total_revenue: number;
  equipments: any[];
}

export interface IVendorReport {
  vendor: string;
  total_revenue: number;
  equipments: any[];
}

export interface ReportForm {
  start_date: Date;
  end_date: Date;
}

export const createFacilityReport = async (
  data: ReportForm
): Promise<IFacilityReport[]> => {
  const response = await axios.post("/reports/facility-revenue-summary", data);
  return response.data;
};

export const createVendorReport = async (
  data: ReportForm
): Promise<IVendorReport[]> => {
  const response = await axios.post("/reports/vendor-revenue-summary", data);
  return response.data;
};

export const getVendorsReport = async (startDate: Date, endDate: Date) => {
  const response = await axios.get("/Report/vendors", {
    params: {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    },
  });
  return response.data;
};

export const getVendorReport = async () => {
  const response = await axios.get("/reports/vendor-revenue-summary");
  return response.data;
};

// export const getFacilitiesReport = async (startDate: Date, endDate: Date) => {
//   const response = await axios.get("/Report/facilities", {
//     params: {
//       startDate: formatDateForApi(startDate),
//       endDate: formatDateForApi(endDate),
//     },
//   });

//   return response.data.data;
// };

export const getFacilitiesReport = async () => {
  const response = await axios.get("/reports/facility-revenue-summary");

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

  return response.data.data;
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

  return response.data.data;
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
  return response.data.data;
};

export const getFacilityTrend = async (facilityId: string, year: number) => {
  const response = await axios.get(
    `/Report/facilities/${facilityId}/trend/${year}`
  );
  return response.data.data;
};
