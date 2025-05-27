import { getPaymentModes } from "@/services/apiPaymentMode";
import { useQuery } from "@tanstack/react-query";

export function usePaymentModes() {
  const {
    isLoading,
    data: paymentModes,
    error,
  } = useQuery({
    queryKey: ["paymentModes"],
    queryFn: getPaymentModes,
  });

  return { isLoading, paymentModes, error };
}
