import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createUser,
  deleteUser,
  getAssignableRoles,
  getUser,
  getUsers,
  updateUser,
  UserCreateRequest,
  UserListParams,
  UserUpdateRequest,
} from "@/services/apiUsers";

export const useUsers = (params: UserListParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });

  return {
    users: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

/**
 * The roles this account may assign, for the user form's role picker.
 *
 * The API scopes the list to the caller, so the form does not have to know
 * that a facility admin may never create another facility admin.
 */
export const useAssignableRoles = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", "roles"],
    queryFn: getAssignableRoles,
    staleTime: 10 * 60 * 1000,
    // A deployment that predates this endpoint 404s; the form falls back to
    // its own list rather than retrying.
    retry: false,
  });

  return { roles: data?.data ?? [], scope: data?.scope, isLoading, error };
};

export const useUser = (userId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId,
  });

  return { user: data, isLoading, error, refetch };
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserCreateRequest) => createUser(data),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to create user"),
  });

  return { createUser: mutate, isCreating: isPending };
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdateRequest }) =>
      updateUser(userId, data),
    onSuccess: (_res, variables) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(error?.response?.data?.message || "Failed to update user"),
  });

  return { updateUser: mutate, isUpdating: isPending };
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.error("Failed to delete user"),
  });

  return { deleteUser: mutate, isDeleting: isPending };
};
