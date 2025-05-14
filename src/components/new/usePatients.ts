import { getRegisteredPatients } from "@/services/apiPatient";
import { useQuery } from "@tanstack/react-query";

export function usePatients() {
  const {
    isPending: isLoading,
    data: patients,
    error,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: getRegisteredPatients,
  });

  return { isLoading, patients, error };
}
