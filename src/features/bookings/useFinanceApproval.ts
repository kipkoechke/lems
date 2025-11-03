import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeApproval, FinanceApprovalRequest } from "@/services/apiBooking";

interface FinanceApprovalParams {
  bookingId: string;
  data: FinanceApprovalRequest;
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
