import { getPatientById } from "@/services/apiPatient";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function usePatient() {
  const { patientId } = useParams();
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
