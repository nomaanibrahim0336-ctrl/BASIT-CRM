"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadFilters, type LeadFiltersValue } from "@/components/leads/LeadFilters";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadForm } from "@/components/leads/LeadForm";
import { useLeads } from "@/hooks/useLeads";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/enums";

export default function LeadsPage() {
  const { teamMember } = useAuth();
  const [filters, setFilters] = useState<LeadFiltersValue>({ search: "", status: "", source: "" });
  const [formOpen, setFormOpen] = useState(false);

  const queryFilters: Record<string, string> = { limit: "50" };
  if (filters.search) queryFilters.search = filters.search;
  if (filters.status) queryFilters.status = filters.status;
  if (filters.source) queryFilters.source = filters.source;

  const { data, isLoading } = useLeads(queryFilters);

  const canCreate =
    teamMember?.role === UserRole.ADMIN || teamMember?.role === UserRole.LEAD_GENERATOR;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leads</h1>
        {canCreate && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        )}
      </div>

      <LeadFilters value={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <LeadsTable leads={data?.data ?? []} />
      )}

      <LeadForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
