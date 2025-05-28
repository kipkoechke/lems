import { useAppDispatch } from "@/hooks/hooks";
import {
  createFacilityReport,
  createVendorReport,
  IFacilityReport,
  IVendorReport,
} from "@/services/apiReport";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateVendorReport() {
  const queryClient = useQueryClient();
  const { mutate: generateVendorReport, isPending: isCreatingVendorReport } =
    useMutation({
      mutationFn: createVendorReport,
      onSuccess: (data: IVendorReport[]) => {
        toast.success("Report generated successfully!");
        queryClient.invalidateQueries({ queryKey: ["facilitiesReport"] });
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
    });

  return { isCreatingVendorReport, generateVendorReport };
}
