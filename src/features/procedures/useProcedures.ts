import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createProcedure,
  deleteProcedure,
  getActiveProcedures,
  getProcedures,
  ProcedureCreateRequest,
  ProcedureListParams,
  ProcedureUpdateRequest,
  updateProcedure,
} from "@/services/apiProcedures";

export const useProcedures = (params: ProcedureListParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["procedures", params],
    queryFn: () => getProcedures(params),
  });

  return {
    procedures: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useActiveProcedures = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["procedures", "active"],
    queryFn: getActiveProcedures,
  });

  return { procedures: data ?? [], isLoading, error };
};

export const useCreateProcedure = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProcedureCreateRequest) => createProcedure(data),
    onSuccess: () => {
      toast.success("Procedure created successfully");
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) =>
      toast.error(
        error?.response?.data?.message || "Failed to create procedure",
      ),
  });

  return { createProcedure: mutate, isCreating: isPending };
};

export const useUpdateProcedure = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: ({
      procedureId,
      data,
    }: {
      procedureId: string;
      data: ProcedureUpdateRequest;
    }) => updateProcedure(procedureId, data),
    onSuccess: () => {
      toast.success("Procedure updated successfully");
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
    },
    onError: () => toast.error("Failed to update procedure"),
  });

  return { updateProcedure: mutate, isUpdating: isPending };
};

export const useDeleteProcedure = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (procedureId: string) => deleteProcedure(procedureId),
    onSuccess: () => {
      toast.success("Procedure retired successfully");
      queryClient.invalidateQueries({ queryKey: ["procedures"] });
    },
    onError: () => toast.error("Failed to retire procedure"),
  });

  return { deleteProcedure: mutate, isDeleting: isPending };
};
