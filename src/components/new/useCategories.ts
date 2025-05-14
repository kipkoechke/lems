import { getServiceCategories } from "@/services/apiCategory";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () => {
  const {
    isLoading,
    data: categories,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getServiceCategories,
  });

  return { isLoading, categories, error };
};
