import { useAppDispatch } from "@/hooks/hooks";
import { createFacilityReport, IFacilityReport } from "@/services/apiReport";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateFacilityReport() {
  const queryClient = useQueryClient();
  const { mutate: createReport, isPending: isCreatingReport } = useMutation({
    mutationFn: createFacilityReport,
    onSuccess: (data: IFacilityReport[]) => {
      toast.success("Report generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["facilitiesReport"] });
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  return { isCreatingReport, createReport };
}
