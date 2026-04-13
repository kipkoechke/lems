import { approveBooking } from "@/services/apiBooking";
import { useMutation } from "@tanstack/react-query";

export function useApproveBooking() {
  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: (bookingId: string) => approveBooking(bookingId),
  });

  return { approve, isApproving };
}
