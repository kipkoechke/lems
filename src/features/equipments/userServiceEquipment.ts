import {
  getEquipmentByService,
  ServiceWithCategory,
} from "@/services/apiEquipment";
import { useQuery } from "@tanstack/react-query";

export const useEquipmentByService = (serviceId: string) => {
  const {
    isLoading,
    data: equipments,
    error,
  } = useQuery<ServiceWithCategory[]>({
    queryKey: ["equipmentByService", serviceId],
    queryFn: () => getEquipmentByService(serviceId),
    enabled: !!serviceId,
  });

  return {
    isLoading,
    data: equipments,
    error,
  };
};
