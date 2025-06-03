import { rejectBooking } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useRejectBooking() {
  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: (bookingId: string) => rejectBooking(bookingId),
    onSuccess: () => {
      toast.success("Service rejected successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject service");
    },
  });

  return { reject, isRejecting };
}
