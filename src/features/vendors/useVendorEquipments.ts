import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getEquipmentCategories,
  getEquipmentStatuses,
  getVendorEquipments,
  getVendorEquipment,
  createVendorEquipment,
  updateVendorEquipment,
  deleteVendorEquipment,
  VendorEquipmentsParams,
  VendorEquipmentCreateRequest,
} from "@/services/apiEquipment";

// Equipment categories hook
export const useEquipmentCategories = () => {
  return useQuery({
    queryKey: ["equipmentCategories"],
    queryFn: getEquipmentCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Equipment statuses hook
export const useEquipmentStatuses = () => {
  return useQuery({
    queryKey: ["equipmentStatuses"],
    queryFn: getEquipmentStatuses,
    staleTime: 1000 * 60 * 60,
  });
};

// List hook with params.
// The /vendor/equipments route infers the vendor from the auth token, so the id
// is only a cache key — it must not gate the query, or a session without a
// vendor entity fires no request at all and the page renders a misleading
// "no equipment yet" empty state.
export const useVendorEquipments = (
  vendorId: string,
  params: VendorEquipmentsParams = {},
) => {
  return useQuery({
    queryKey: ["vendorEquipments", vendorId, params],
    queryFn: () => getVendorEquipments(vendorId, params),
  });
};

// Single item hook
export const useVendorEquipment = (vendorId: string, equipmentId: string) => {
  return useQuery({
    queryKey: ["vendorEquipment", vendorId, equipmentId],
    queryFn: () => getVendorEquipment(vendorId, equipmentId),
    enabled: !!equipmentId,
  });
};

// Create mutation
export const useCreateVendorEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: VendorEquipmentCreateRequest;
    }) => createVendorEquipment(vendorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vendorEquipments", variables.vendorId],
      });
      toast.success("Equipment created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create equipment");
    },
  });
};

// Update mutation
export const useUpdateVendorEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      equipmentId,
      data,
    }: {
      vendorId: string;
      equipmentId: string;
      data: VendorEquipmentCreateRequest;
    }) => updateVendorEquipment(vendorId, equipmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vendorEquipments", variables.vendorId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "vendorEquipment",
          variables.vendorId,
          variables.equipmentId,
        ],
      });
      toast.success("Equipment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update equipment");
    },
  });
};

// Delete mutation
export const useDeleteVendorEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      equipmentId,
    }: {
      vendorId: string;
      equipmentId: string;
    }) => deleteVendorEquipment(vendorId, equipmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["vendorEquipments", variables.vendorId],
      });
      toast.success("Equipment deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete equipment");
    },
  });
};
