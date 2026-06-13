"use client";

import { Users, Briefcase, Activity, DollarSign, Wallet, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/dashboard/StatCard";
import { DealsByStageChart } from "@/components/dashboard/DealsByStageChart";
import { Skeleton } from "@/components/ui/skeleton";
import { LEAD_STATUS_LABELS, DEAL_STAGE_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { UserRole } from "@/types/enums";

export default function DashboardPage() {
  const { teamMember } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !teamMember) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome back, {teamMember.fullName.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          {ROLE_LABELS[teamMember.role]} overview
        </p>
      </div>

      {teamMember.role === UserRole.ADMIN && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} />
            <StatCard title="New Leads" value={stats.newLeads} icon={Activity} />
            <StatCard title="Total Deals" value={stats.totalDeals} icon={Briefcase} />
            <StatCard title="Active Deals" value={stats.activeDeals} icon={Briefcase} />
            <StatCard
              title="Pending Balance"
              value={formatCurrency(stats.pendingBalanceTotal)}
              icon={Wallet}
            />
            <StatCard
              title="Revenue This Month"
              value={formatCurrency(stats.revenueThisMonth)}
              icon={DollarSign}
            />
          </div>
          <DealsByStageChart data={stats.dealsByStage} />
        </>
      )}

      {teamMember.role === UserRole.LEAD_GENERATOR && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Leads Generated" value={stats.totalGenerated} icon={Users} />
          {stats.byStatus?.map((s: any) => (
            <StatCard
              key={s.leadStatus}
              title={LEAD_STATUS_LABELS[s.leadStatus as keyof typeof LEAD_STATUS_LABELS]}
              value={s._count._all}
              icon={Activity}
            />
          ))}
        </div>
      )}

      {teamMember.role === UserRole.SALES_CLOSER && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Assigned Leads" value={stats.assignedLeads} icon={Users} />
          <StatCard title="Assigned Deals" value={stats.assignedDeals} icon={Briefcase} />
          <StatCard title="Active Deals" value={stats.activeDeals} icon={Activity} />
        </div>
      )}

      {teamMember.role === UserRole.DESIGNER && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Assigned Deals" value={stats.assigned} icon={Briefcase} />
          {stats.byStage?.map((s: any) => (
            <StatCard
              key={s.dealStage}
              title={DEAL_STAGE_LABELS[s.dealStage as keyof typeof DEAL_STAGE_LABELS]}
              value={s._count._all}
              icon={Activity}
            />
          ))}
        </div>
      )}

      {teamMember.role === UserRole.MERCHANT && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Revenue This Month"
            value={formatCurrency(stats.revenueThisMonth)}
            icon={DollarSign}
          />
          <StatCard
            title="Expenses This Month"
            value={formatCurrency(stats.expensesThisMonth)}
            icon={Receipt}
          />
          <StatCard
            title="Pending Balance"
            value={formatCurrency(stats.pendingBalanceTotal)}
            icon={Wallet}
          />
        </div>
      )}
    </div>
  );
}
