"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ExchangeRate, Expense, MonthlyPnL, RevenueLog, SalarySplit } from "@/types/database";
import type { PaginatedResponse } from "@/types/api";

// ─── REVENUE ────────────────────────────────────────────────────────────────

export function useRevenueLogs(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "50", ...filters });

  return useQuery({
    queryKey: ["revenue", filters],
    queryFn: () => apiFetch<PaginatedResponse<RevenueLog>>(`/api/finance/revenue?${params.toString()}`),
  });
}

export function useCreateRevenueLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<RevenueLog>("/api/finance/revenue", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["revenue"] }),
  });
}

export function useUpdateRevenueLog(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<RevenueLog>(`/api/finance/revenue/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["revenue"] }),
  });
}

export function useDeleteRevenueLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/finance/revenue/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["revenue"] }),
  });
}

// ─── EXPENSES ───────────────────────────────────────────────────────────────

export function useExpenses(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "50", ...filters });

  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: () => apiFetch<PaginatedResponse<Expense>>(`/api/finance/expenses?${params.toString()}`),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Expense>("/api/finance/expenses", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Expense>(`/api/finance/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/finance/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

// ─── SALARY SPLITS ──────────────────────────────────────────────────────────

export function useSalarySplits(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "50", ...filters });

  return useQuery({
    queryKey: ["salary-splits", filters],
    queryFn: () => apiFetch<PaginatedResponse<SalarySplit>>(`/api/finance/salary-splits?${params.toString()}`),
  });
}

export function useCreateSalarySplit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<SalarySplit>("/api/finance/salary-splits", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salary-splits"] }),
  });
}

export function useUpdateSalarySplit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<SalarySplit>(`/api/finance/salary-splits/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salary-splits"] }),
  });
}

export function useDeleteSalarySplit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/finance/salary-splits/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salary-splits"] }),
  });
}

// ─── P&L ────────────────────────────────────────────────────────────────────

export function useMonthlyPnL(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "24", ...filters });

  return useQuery({
    queryKey: ["pnl", filters],
    queryFn: () => apiFetch<PaginatedResponse<MonthlyPnL>>(`/api/finance/pnl?${params.toString()}`),
  });
}

export function useSyncSheets() {
  return useMutation({
    mutationFn: () => apiFetch("/api/sync-sheets", { method: "POST" }),
  });
}

export function useRecalculatePnL() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch<MonthlyPnL>("/api/finance/calculate-pnl", { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pnl"] }),
  });
}

// ─── EXCHANGE RATE ──────────────────────────────────────────────────────────

export function useExchangeRate() {
  return useQuery({
    queryKey: ["exchange-rate"],
    queryFn: () => apiFetch<ExchangeRate | null>("/api/finance/exchange-rate"),
  });
}

export function useSetExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { rate: number; effectiveDate?: string }) =>
      apiFetch<ExchangeRate>("/api/finance/exchange-rate", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rate"] });
      queryClient.invalidateQueries({ queryKey: ["pnl"] });
    },
  });
}
