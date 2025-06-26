import {
  BookingCreationResponse,
  createServiceBooking,
} from "@/services/apiBooking";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  const { mutate: createBooking, isPending: isCreating } = useMutation({
    mutationFn: createServiceBooking,
    onSuccess: (data: BookingCreationResponse) => {
      // Just invalidate cache, let the component handle the success logic
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong", {
        id: "createBooking",
      });
    },
  });

  return { createBooking, isCreating };
}
