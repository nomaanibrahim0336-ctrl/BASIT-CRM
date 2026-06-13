import { StatCard } from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryItem {
  title: string;
  value: number;
  icon?: LucideIcon;
}

export function FinanceSummaryCards({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.title} title={item.title} value={formatCurrency(item.value)} icon={item.icon} />
      ))}
    </div>
  );
}
