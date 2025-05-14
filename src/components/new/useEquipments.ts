import { getEquipments } from "@/services/apiEquipment";
import { useQuery } from "@tanstack/react-query";

export function useEquipments() {
  const {
    isLoading,
    data: equipments,
    error,
  } = useQuery({
    queryKey: ["equipments"],
    queryFn: getEquipments,
  });

  return { isLoading, equipments, error };
}
