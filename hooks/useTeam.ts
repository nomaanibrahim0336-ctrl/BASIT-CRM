"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Team } from "@/types/database";
import type { PaginatedResponse } from "@/types/api";

export function useTeamMembers(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "100", ...filters });

  return useQuery({
    queryKey: ["team", filters],
    queryFn: () => apiFetch<PaginatedResponse<Team>>(`/api/team?${params.toString()}`),
  });
}

export function useTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: ["team", id],
    queryFn: () => apiFetch<Team>(`/api/team/${id}`),
    enabled: !!id,
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Team>("/api/team", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team"] }),
  });
}

export function useUpdateTeamMember(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Team>(`/api/team/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/team/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team"] }),
  });
}
