import { StatCard } from "@/components/dashboard/StatCard";
import { formatUSD } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryItem {
  title: string;
  value: number;
  icon?: LucideIcon;
  format?: (value: number) => string;
}

export function FinanceSummaryCards({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={(item.format ?? formatUSD)(item.value)}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
