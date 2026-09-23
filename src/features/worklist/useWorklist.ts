import { useQuery } from "@tanstack/react-query";
import { getPractitionerWorklist } from "@/services/apiWorklist";
import type { WorklistParams } from "@/types/worklist";

export const useWorklist = (
  params: WorklistParams = {},
  options: { enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: ["practitioner-worklist", params],
    queryFn: () => getPractitionerWorklist(params),
    // Roles without worklist access must not fire the request at all.
    enabled: options.enabled ?? true,
  });
};
