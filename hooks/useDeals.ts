"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Deal } from "@/types/database";
import type { PaginatedResponse } from "@/types/api";

export function useDeals(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters);

  return useQuery({
    queryKey: ["deals", filters],
    queryFn: () => apiFetch<PaginatedResponse<Deal>>(`/api/deals?${params.toString()}`),
  });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: ["deals", id],
    queryFn: () => apiFetch<Deal>(`/api/deals/${id}`),
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Deal>("/api/deals", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
  });
}

export function useUpdateDeal(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Deal>(`/api/deals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/deals/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals"] }),
  });
}
