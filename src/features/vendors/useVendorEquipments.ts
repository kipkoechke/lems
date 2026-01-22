import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getVendorEquipments,
  getVendorEquipment,
  createVendorEquipment,
  updateVendorEquipment,
  deleteVendorEquipment,
  VendorEquipmentsParams,
  VendorEquipmentCreateRequest,
} from "@/services/apiEquipment";

// List hook with params
export const useVendorEquipments = (
  vendorId: string,
  params: VendorEquipmentsParams = {}
) => {
  return useQuery({
    queryKey: ["vendorEquipments", vendorId, params],
    queryFn: () => getVendorEquipments(vendorId, params),
    enabled: !!vendorId,
  });
};

// Single item hook
export const useVendorEquipment = (vendorId: string, equipmentId: string) => {
  return useQuery({
    queryKey: ["vendorEquipment", vendorId, equipmentId],
    queryFn: () => getVendorEquipment(vendorId, equipmentId),
    enabled: !!vendorId && !!equipmentId,
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
        queryKey: ["vendorEquipment", variables.vendorId, variables.equipmentId],
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
