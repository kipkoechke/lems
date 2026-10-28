import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  deleteAdminVendorEquipment,
  deleteEquipment,
  getEquipmentDetail,
  updateAdminVendorEquipment,
  VendorEquipmentCreateRequest,
} from "@/services/apiEquipment";

/**
 * Equipment detail for the admin-facing page, read from the shared
 * /equipment/{id} route. The vendor-portal hooks read /vendor/equipments/{id},
 * which 403s for every non-vendor role.
 */
export const useEquipmentDetail = (equipmentId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["equipment-detail", equipmentId],
    queryFn: () => getEquipmentDetail(equipmentId),
    enabled: !!equipmentId,
  });

  return { equipment: data, isLoading, error, refetch };
};

export interface DeleteEquipmentVariables {
  /**
   * Vendor-scoped equipment uses the cascading admin route. Facility-owned
   * equipment has no vendor to scope it to, so it falls back to the shared
   * `/equipment/{id}` delete.
   */
  vendorId?: string | null;
  equipmentId: string;
}

/**
 * Everything the admin delete cascades into: equipment listings and counts,
 * contract services, bookings, and ping requests.
 */
const CASCADED_QUERY_KEYS = [
  "admin-equipments",
  "admin-dashboard",
  "admin-equipment-modality-counts",
  "vendorEquipments",
  "vendorEquipment",
  "vendorDashboard",
  "bookings",
  "bookings-paginated",
  "booking",
  "vendor-bookings",
  "vendor-bookings-paginated",
  "vendor-contracts",
  "vendor-contract",
  "vendor-contract-services",
  "contracts",
  "contract",
  "contractServices",
  "ping-requests",
  "device-activity",
  "pending-installation",
];

/**
 * Permanently deletes equipment through the vendor-nested admin route.
 *
 * That endpoint cascades — contract services, booked services, bookings left
 * without services, and ping requests all go with it — so every cached view
 * that counts equipment, bookings or earnings is invalidated.
 */
export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ vendorId, equipmentId }: DeleteEquipmentVariables) =>
      vendorId
        ? deleteAdminVendorEquipment(vendorId, equipmentId)
        : deleteEquipment(equipmentId),
    onSuccess: (_, variables) => {
      toast.success("Equipment deleted successfully");
      CASCADED_QUERY_KEYS.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [queryKey] }),
      );
      // The record is gone, so refetching its detail would only 404.
      queryClient.removeQueries({
        queryKey: ["equipment-detail", variables.equipmentId],
      });
    },
    onError: (error: Error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete equipment",
      );
    },
  });

  return {
    deleteEquipment: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};

/**
 * Equipment update for the admin-facing edit pages. Goes to the vendor-nested
 * admin route (PATCH /vendors/{vendor}/equipments/{id}); the vendor-portal hook
 * `useUpdateVendorEquipment` hits /vendor/equipments/{id}, which infers the
 * vendor from the token and 403s for admins.
 */
export const useUpdateAdminEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      equipmentId,
      data,
    }: {
      vendorId: string;
      equipmentId: string;
      data: Partial<VendorEquipmentCreateRequest>;
    }) => updateAdminVendorEquipment(vendorId, equipmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-equipments"] });
      queryClient.invalidateQueries({
        queryKey: ["equipment-detail", variables.equipmentId],
      });
      toast.success("Equipment updated successfully");
    },
    onError: (error: Error) => {
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update equipment",
      );
    },
  });
};
