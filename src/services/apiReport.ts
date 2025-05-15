// apiReport.ts
export const fetchFacilityReport = async (startDate: Date, endDate: Date) => {
  const url = new URL(
    "https://vemsapi.azurewebsites.net/api/Report/facilities"
  );

  // Format dates in the exact format expected by the API: 2024-05-15T12:00:00.000Z
  const formatDateForApi = (date: Date) => {
    return date.toISOString();
  };

  url.searchParams.append("startDate", formatDateForApi(startDate));
  url.searchParams.append("endDate", formatDateForApi(endDate));

  console.log("Request URL:", url.toString()); // For debugging

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text(); // Get error details
    throw new Error(`Failed to fetch facility report: ${errorText}`);
  }

  const data = await response.json();
  console.log("Response data:", data); // For debugging

  return data;
};
