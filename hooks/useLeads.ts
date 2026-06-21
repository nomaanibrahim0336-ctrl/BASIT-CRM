"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { DailyLeadCount, Lead } from "@/types/database";
import type { PaginatedResponse } from "@/types/api";

export function useLeads(filters: Record<string, string> = {}) {
  const params = new URLSearchParams(filters);

  return useQuery({
    queryKey: ["leads", filters],
    queryFn: () => apiFetch<PaginatedResponse<Lead>>(`/api/leads?${params.toString()}`),
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => apiFetch<Lead>(`/api/leads/${id}`),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Lead>("/api/leads", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Lead>(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
}

// ─── DAILY LEAD COUNTS ──────────────────────────────────────────────────────

export function useDailyLeadCounts(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "100", ...filters });

  return useQuery({
    queryKey: ["daily-lead-counts", filters],
    queryFn: () =>
      apiFetch<PaginatedResponse<DailyLeadCount>>(`/api/leads/daily-count?${params.toString()}`),
  });
}

export function useLogDailyLeadCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { logDate: string; count: number; notes?: string | null; teamMemberId?: string }) =>
      apiFetch<DailyLeadCount>("/api/leads/daily-count", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-lead-counts"] }),
  });
}

export function useDeleteDailyLeadCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/leads/daily-count/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-lead-counts"] }),
  });
}
