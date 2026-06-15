"use client";

import { Users, Briefcase, Activity, DollarSign, Wallet, Receipt } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { StatCard } from "@/components/dashboard/StatCard";
import { DealsByStageChart } from "@/components/dashboard/DealsByStageChart";
import { Skeleton } from "@/components/ui/skeleton";
import { LEAD_STATUS_LABELS, DEAL_STAGE_LABELS, ROLE_LABELS } from "@/lib/constants";
import { formatCurrency, formatPKR } from "@/lib/utils";
import { UserRole } from "@/types/enums";

export default function DashboardPage() {
  const { teamMember } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !teamMember) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="gradient-hero relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-blue-200/80">{greeting}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Welcome back,{" "}
            <span className="text-gradient-blue">
              {teamMember.fullName.split(" ")[0]}
            </span>
          </h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.7)]" />
            {ROLE_LABELS[teamMember.role]} overview
          </div>
        </div>
      </div>

      {teamMember.role === UserRole.ADMIN && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Total Leads" value={stats.totalLeads} icon={Users} accent="blue" />
            <StatCard title="New Leads" value={stats.newLeads} icon={Activity} accent="sky" />
            <StatCard title="Total Deals" value={stats.totalDeals} icon={Briefcase} accent="indigo" />
            <StatCard title="Active Deals" value={stats.activeDeals} icon={Briefcase} accent="cyan" />
            <StatCard
              title="Pending Balance"
              value={formatCurrency(stats.pendingBalanceTotal)}
              icon={Wallet}
              accent="violet"
            />
            <StatCard
              title="Revenue This Month"
              value={formatCurrency(stats.revenueThisMonth)}
              icon={DollarSign}
              accent="blue"
            />
          </div>
          <DealsByStageChart data={stats.dealsByStage} />
        </>
      )}

      {teamMember.role === UserRole.LEAD_GENERATOR && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Leads Generated" value={stats.totalGenerated} icon={Users} accent="blue" />
          {stats.byStatus?.map((s: any, i: number) => (
            <StatCard
              key={s.leadStatus}
              title={LEAD_STATUS_LABELS[s.leadStatus as keyof typeof LEAD_STATUS_LABELS]}
              value={s._count._all}
              icon={Activity}
              accent={cycleAccent(i)}
            />
          ))}
        </div>
      )}

      {teamMember.role === UserRole.SALES_CLOSER && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Assigned Leads" value={stats.assignedLeads} icon={Users} accent="blue" />
          <StatCard title="Assigned Deals" value={stats.assignedDeals} icon={Briefcase} accent="indigo" />
          <StatCard title="Active Deals" value={stats.activeDeals} icon={Activity} accent="cyan" />
        </div>
      )}

      {teamMember.role === UserRole.DESIGNER && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Assigned Deals" value={stats.assigned} icon={Briefcase} accent="blue" />
          {stats.byStage?.map((s: any, i: number) => (
            <StatCard
              key={s.dealStage}
              title={DEAL_STAGE_LABELS[s.dealStage as keyof typeof DEAL_STAGE_LABELS]}
              value={s._count._all}
              icon={Activity}
              accent={cycleAccent(i)}
            />
          ))}
        </div>
      )}

      {teamMember.role === UserRole.MERCHANT && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Revenue This Month"
            value={formatCurrency(stats.revenueThisMonth)}
            icon={DollarSign}
            accent="blue"
          />
          <StatCard
            title="Expenses This Month"
            value={formatPKR(stats.expensesThisMonth)}
            icon={Receipt}
            accent="violet"
          />
          <StatCard
            title="Pending Balance"
            value={formatCurrency(stats.pendingBalanceTotal)}
            icon={Wallet}
            accent="cyan"
          />
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function cycleAccent(i: number): "blue" | "sky" | "indigo" | "cyan" | "violet" {
  const order = ["blue", "sky", "indigo", "cyan", "violet"] as const;
  return order[i % order.length];
}
