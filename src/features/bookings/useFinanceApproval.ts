import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeApproval, FinanceApprovalPayload } from "@/services/apiBooking";

interface FinanceApprovalParams {
  bookingId: string;
  data: FinanceApprovalPayload;
}

export function useFinanceApproval() {
  const queryClient = useQueryClient();

  const { mutate: approveFinance, isPending: isApproving } = useMutation({
    mutationFn: ({ bookingId, data }: FinanceApprovalParams) =>
      financeApproval(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  return { approveFinance, isApproving };
}
