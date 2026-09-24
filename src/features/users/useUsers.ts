import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createUser,
  deleteUser,
  getAssignableRoles,
  sendPasswordResetLink,
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

/**
 * Email an account a fresh password reset link.
 *
 * Reach is decided server-side by role rank — the caller must outrank the
 * target, and a facility admin must share its facility — so a 403 here means
 * "not yours to reset" rather than a bug, and is reported as such.
 */
export const useSendPasswordResetLink = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: (userId: string) => sendPasswordResetLink(userId),
    onSuccess: (result) => {
      toast.success(
        result?.message ||
          `A reset link is on its way to ${result?.data?.email ?? "them"}.`,
      );
    },
    onError: (error: {
      response?: { status?: number; data?: { message?: string } };
    }) => {
      const status = error?.response?.status;
      if (status === 403) {
        toast.error("You cannot reset the password of someone at your level or above.");
        return;
      }
      if (status === 422) {
        toast.error("That account has no email address, so there is nowhere to send it.");
        return;
      }
      toast.error(error?.response?.data?.message || "Could not send the link");
    },
  });

  return { sendResetLink: mutate, isSendingResetLink: isPending };
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
    onSuccess: (user) => {
      // No password is set or returned: the account is handed over by a
      // welcome mail carrying a single-use link. Whether that mail went is
      // the only thing worth reporting, because nobody can sign in until it
      // arrives.
      if (user?.welcome_email_sent === false) {
        toast.error(
          "Account created, but no welcome email could be sent — it has no email address. Send a reset link once one is on file.",
          { duration: 8000 },
        );
      } else {
        toast.success(
          `Account created. A link to set their password has been emailed${
            user?.email ? ` to ${user.email}` : ""
          }.`,
          { duration: 6000 },
        );
      }
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
