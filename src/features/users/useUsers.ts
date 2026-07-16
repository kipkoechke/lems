import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createUser,
  deleteUser,
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
