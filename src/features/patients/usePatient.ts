import { getPatientById } from "@/services/apiPatient";
import { useQuery } from "@tanstack/react-query";

export function usePatient(id: string) {
  const {
    isLoading,
    data: patient,
    error,
  } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id as string),
    enabled: !!id,
    retry: false,
  });

  return { isLoading, patient, error };
}
