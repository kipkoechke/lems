export interface Patient {
  patientId: string;
  patientName: string;
  mobileNumber: string;
  dateOfBirth: string;
  paymentMode: "Cash" | "SHA" | "Insurance";
}

export interface PatientRegistrationForm {
  patientName: string;
  mobileNumber: string;
  dateOfBirth: string;
  paymentMode: "Cash" | "SHA" | "Insurance";
}

export const BASEURL = "https://vemsapi.azurewebsites.net/api";

export const registerPatient = async (
  data: PatientRegistrationForm
): Promise<Patient> => {
  const response = await fetch(`${BASEURL}/Patient`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to register patient");
  }

  return response.json();
};

export const getRegisteredPatients = async (): Promise<Patient[]> => {
  const response = await fetch(`${BASEURL}/Patient`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch registered patients");
  }

  return response.json();
};

export const getPatientById = async (patientID: string): Promise<Patient> => {
  const response = await fetch(`${BASEURL}/Patient/${patientID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch patient details");
  }

  return response.json();
};
