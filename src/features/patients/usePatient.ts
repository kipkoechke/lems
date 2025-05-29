import { getPatientById } from "@/services/apiPatient";
import { useQuery } from "@tanstack/react-query";

export function usePatient(patientId: string) {
  const {
    isLoading,
    data: patient,
    error,
  } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId as string),
    enabled: !!patientId,
    retry: false,
  });

  return { isLoading, patient, error };
}
