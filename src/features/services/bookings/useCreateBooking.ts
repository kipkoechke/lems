import { goToNextStep, setBooking } from "@/context/workflowSlice";
import { useAppDispatch } from "@/hooks/hooks";
import { createServiceBooking, IServiceBooking } from "@/services/apiBooking";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  const dispatch = useAppDispatch();

  const { mutate: createBooking, isPending: isCreating } = useMutation({
    mutationFn: createServiceBooking,
    onSuccess: (data: IServiceBooking) => {
      toast.success("Booking created successfully!", {
        id: "createBooking",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      dispatch(setBooking(data));
      dispatch(goToNextStep());
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong", {
        id: "createBooking",
      });
    },
  });

  return { createBooking, isCreating };
}
