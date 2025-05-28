import { getEquipmentByService } from "@/services/apiEquipment";
import { useQuery } from "@tanstack/react-query";

export const useEquipmentByService = (serviceId: string) => {
  const {
    isPending: isEquipmentsLoading,
    data: equipments,
    error,
  } = useQuery({
    queryKey: ["equipmentByService", serviceId],
    queryFn: () => getEquipmentByService(serviceId),
    enabled: !!serviceId,
  });

  return {
    isEquipmentsLoading,
    equipments,
    error,
  };
};
