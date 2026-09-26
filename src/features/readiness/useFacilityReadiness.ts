"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getFacilityReadiness,
  FacilityReadinessParams,
} from "@/services/apiFacilityReadiness";
import {
  getFacilityRanking,
  FacilityRankingParams,
} from "@/services/apiFacilityRanking";

export const useFacilityReadiness = (params: FacilityReadinessParams = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["facility-readiness", params],
    queryFn: () => getFacilityReadiness(params),
    // Filter changes re-query; keep the report on screen rather than dropping
    // back to a skeleton on every control.
    placeholderData: (previous) => previous,
  });

  return {
    facilities: data?.data ?? [],
    summary: data?.summary,
    availableFilters: data?.available_filters,
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

export const useFacilityRanking = (params: FacilityRankingParams = {}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["facility-ranking", params],
    queryFn: () => getFacilityRanking(params),
    placeholderData: (previous) => previous,
  });

  return {
    rows: data?.data ?? [],
    summary: data?.summary,
    availableFilters: data?.available_filters,
    pagination: data?.pagination,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
