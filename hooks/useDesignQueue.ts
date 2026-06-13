"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Deal } from "@/types/database";

export function useDesignQueue() {
  return useQuery({
    queryKey: ["design-queue"],
    queryFn: () => apiFetch<Deal[]>("/api/design-queue"),
  });
}
