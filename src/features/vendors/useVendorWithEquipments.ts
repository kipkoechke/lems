import { getVendorWithEquipments, VendorWithEquipments } from "@/services/apiVendors";
import { useQuery } from "@tanstack/react-query";

export const useVendorWithEquipments = (vendorId: string) => {
  const {
    isLoading,
    data: vendorData,
    error,
  } = useQuery<VendorWithEquipments>({
    queryKey: ["vendor-equipments", vendorId],
    queryFn: () => getVendorWithEquipments(vendorId),
    enabled: !!vendorId, // Only fetch if vendorId is provided
  });

  return {
    isLoading,
    vendor: vendorData?.vendor,
    equipments: vendorData?.vendor?.equipments || [],
    error,
  };
};
