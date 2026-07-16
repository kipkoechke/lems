import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  assignUserPermission,
  createPermission,
  deletePermission,
  getPermissions,
  getUserPermissions,
  PermissionCreateRequest,
  PermissionListParams,
  PermissionUpdateRequest,
  unassignUserPermission,
  updatePermission,
} from "@/services/apiUsers";

// ---------- Permissions catalog ----------

export const usePermissionsCatalog = (params: PermissionListParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["permissions", params],
    queryFn: () => getPermissions(params),
  });

  return {
    permissions: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PermissionCreateRequest) => createPermission(data),
    onSuccess: () => {
      toast.success("Permission created successfully");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(
        error?.response?.data?.message || "Failed to create permission",
      ),
  });

  return { createPermission: mutate, isCreating: isPending };
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      permissionId,
      data,
    }: {
      permissionId: string;
      data: PermissionUpdateRequest;
    }) => updatePermission(permissionId, data),
    onSuccess: () => {
      toast.success("Permission updated successfully");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => toast.error("Failed to update permission"),
  });

  return { updatePermission: mutate, isUpdating: isPending };
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (permissionId: string) => deletePermission(permissionId),
    onSuccess: () => {
      toast.success("Permission deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => toast.error("Failed to delete permission"),
  });

  return { deletePermission: mutate, isDeleting: isPending };
};

// ---------- User ↔ permission assignment ----------

export const useUserPermissions = (userId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-permissions", userId],
    queryFn: () => getUserPermissions(userId),
    enabled: !!userId,
  });

  return { permissions: data ?? [], isLoading, error, refetch };
};

export const useAssignUserPermission = (userId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      permissionId,
      grantedBy,
    }: {
      permissionId: string;
      grantedBy?: string;
    }) => assignUserPermission(userId, permissionId, grantedBy),
    onSuccess: () => {
      toast.success("Permission assigned");
      queryClient.invalidateQueries({ queryKey: ["user-permissions", userId] });
    },
    onError: () => toast.error("Failed to assign permission"),
  });

  return { assignPermission: mutate, isAssigning: isPending };
};

export const useUnassignUserPermission = (userId: string) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (permissionId: string) =>
      unassignUserPermission(userId, permissionId),
    onSuccess: () => {
      toast.success("Permission removed");
      queryClient.invalidateQueries({ queryKey: ["user-permissions", userId] });
    },
    onError: () => toast.error("Failed to remove permission"),
  });

  return { unassignPermission: mutate, isUnassigning: isPending };
};
