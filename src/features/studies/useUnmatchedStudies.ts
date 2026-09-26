"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getUnmatchedStudies,
  UnmatchedStudiesParams,
  UnmatchedStudiesScope,
} from "@/services/apiUnmatchedStudies";
import { useCurrentUser } from "@/hooks/useAuth";
import { isFacilityRole, UserRole } from "@/lib/rbac";

/**
 * The listing scope this account may call.
 *
 * The three endpoints return the same shape over different populations, so the
 * role decides the path and nothing else in the page changes.
 */
export const useUnmatchedStudiesScope = (): UnmatchedStudiesScope | null => {
  const user = useCurrentUser();
  if (!user?.role) return null;
  if (user.role === UserRole.VENDOR) return "vendor";
  if (isFacilityRole(user.role)) return "facility";
  return "admin";
};

export const useUnmatchedStudies = (
  scope: UnmatchedStudiesScope | null,
  params: UnmatchedStudiesParams = {},
) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["unmatched-studies", scope, params],
    queryFn: () => getUnmatchedStudies(scope!, params),
    enabled: !!scope,
    placeholderData: (previous) => previous,
  });

  return {
    studies: data?.data ?? [],
    summary: data?.summary,
    availableFilters: data?.available_filters,
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
