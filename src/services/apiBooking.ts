export interface IServiceBooking {
  bookingId: string;
  patientId: string;
  serviceId: string;
  equipmentId: string;
  facilityId: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string;
  cost: number;
}

export interface ServiceBookingForm {
  patientId: string;
  serviceId: string;
  equipmentId: string;
  facilityId: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string;
  cost: number;
}

export interface PatientConsent {
  bookingId: string;
  patientId: string;
  otpCode: string;
  consent: boolean;
}

export const createServiceBooking = async (
  data: ServiceBookingForm
): Promise<IServiceBooking> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceBooking`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  console.log("Response from booking API:", response);
  if (!response.ok) {
    throw new Error("Failed to book service");
  }

  return response.json();
};

export const patientConsent = async (
  data: PatientConsent
): Promise<PatientConsent> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceBooking/patient-consent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to submit patient consent");
  }
  return response.json();
};

export const getServiceBookingPatient = async (
  patientId: string
): Promise<IServiceBooking[]> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceBooking/patient/${patientId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch service bookings for patient");
  }

  return response.json();
};

export const getServiceBookingFacility = async (
  facilityId: string
): Promise<IServiceBooking[]> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceBooking/facility/${facilityId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch service bookings for facility");
  }
  return response.json();
};

export const getServiceBookingById = async (
  bookingId: string
): Promise<IServiceBooking> => {
  const response = await fetch(
    `https://vemsapi.azurewebsites.net/api/ServiceBooking/${bookingId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch service booking details");
  }

  return response.json();
};
