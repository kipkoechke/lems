import { useWorkflow } from "@/context/WorkflowContext";
import { createServiceBooking, IServiceBooking } from "@/services/apiBooking";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateBooking() {
  const { dispatch, goToNextStep } = useWorkflow();
  const queryClient = useQueryClient();

  const { mutate: createBooking, isPending: isCreating } = useMutation({
    mutationFn: createServiceBooking,
    onSuccess: (data: IServiceBooking) => {
      toast.success("Booking created successfully!", {
        id: "createBooking",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      dispatch({ type: "SET_BOOKING", payload: data });
      goToNextStep();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong", {
        id: "createBooking",
      });
    },
  });

  return { createBooking, isCreating };
}
