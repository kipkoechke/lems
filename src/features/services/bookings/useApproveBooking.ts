import { approveBooking } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useApproveBooking() {
  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (bookingId: string) => approveBooking(bookingId),
    onSuccess: (data) => {
      toast.success("Booking approved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve booking");
    },
  });

  return { approve, isApproving };
}
