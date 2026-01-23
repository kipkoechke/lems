import { useQuery } from "@tanstack/react-query";
import { getPractitionerWorklist } from "@/services/apiWorklist";
import type { WorklistParams } from "@/types/worklist";

export const useWorklist = (params: WorklistParams = {}) => {
  return useQuery({
    queryKey: ["practitioner-worklist", params],
    queryFn: () => getPractitionerWorklist(params),
  });
};
