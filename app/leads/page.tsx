"use client";

import { useState } from "react";
import { ListPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadFilters, type LeadFiltersValue } from "@/components/leads/LeadFilters";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadForm } from "@/components/leads/LeadForm";
import { DailyLeadCountWidget } from "@/components/leads/DailyLeadCountForm";
import { DailyLeadCountTable } from "@/components/leads/DailyLeadCountTable";
import { DailyLeadCountEntryDialog } from "@/components/leads/DailyLeadCountEntryDialog";
import { useLeads, useDailyLeadCounts } from "@/hooks/useLeads";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/enums";
import type { DailyLeadCount, Lead } from "@/types/database";

export default function LeadsPage() {
  const { teamMember } = useAuth();
  const [filters, setFilters] = useState<LeadFiltersValue>({ search: "", status: "", source: "" });
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [editingCount, setEditingCount] = useState<DailyLeadCount | undefined>(undefined);

  const queryFilters: Record<string, string> = { limit: "50" };
  if (filters.search) queryFilters.search = filters.search;
  if (filters.status) queryFilters.status = filters.status;
  if (filters.source) queryFilters.source = filters.source;

  const { data, isLoading } = useLeads(queryFilters);

  const isAdmin = teamMember?.role === UserRole.ADMIN;
  const isLeadGenerator = teamMember?.role === UserRole.LEAD_GENERATOR;
  const isCloser = teamMember?.role === UserRole.SALES_CLOSER;
  const canCreate = isAdmin || isLeadGenerator || isCloser;
  const canSeeCounts = isAdmin || isLeadGenerator || isCloser;
  const canManageCounts = isAdmin || isCloser;

  const { data: countsData, isLoading: countsLoading } = useDailyLeadCounts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Leads</h1>
        {canCreate && (
          <Button
            onClick={() => {
              setEditingLead(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        )}
      </div>

      {isLeadGenerator && <DailyLeadCountWidget />}

      <LeadFilters value={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <LeadsTable
          leads={data?.data ?? []}
          onEdit={(lead) => {
            setEditingLead(lead);
            setFormOpen(true);
          }}
        />
      )}

      {canSeeCounts && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Daily Lead Counts</h2>
            {canManageCounts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingCount(undefined);
                  setCountDialogOpen(true);
                }}
              >
                <ListPlus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            )}
          </div>
          {countsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <DailyLeadCountTable
              entries={countsData?.data ?? []}
              showTeamMember={isAdmin || isCloser}
              canEdit={canManageCounts}
              canDelete={isAdmin}
              onEdit={(entry) => {
                setEditingCount(entry);
                setCountDialogOpen(true);
              }}
            />
          )}
        </div>
      )}

      <LeadForm open={formOpen} onOpenChange={setFormOpen} lead={editingLead} />
      {canManageCounts && (
        <DailyLeadCountEntryDialog
          open={countDialogOpen}
          onOpenChange={setCountDialogOpen}
          entry={editingCount}
        />
      )}
    </div>
  );
}
