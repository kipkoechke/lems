import { createVendorReport } from "@/services/apiReport";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateVendorReport() {
  const queryClient = useQueryClient();
  const { mutate: generateVendorReport, isPending: isCreatingVendorReport } =
    useMutation({
      mutationFn: createVendorReport,
      onSuccess: () => {
        toast.success("Report generated successfully!");
        queryClient.invalidateQueries({ queryKey: ["facilitiesReport"] });
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
    });

  return { isCreatingVendorReport, generateVendorReport };
}
