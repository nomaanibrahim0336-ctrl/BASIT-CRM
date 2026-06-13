"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Palette,
  DollarSign,
  Receipt,
  Split,
  TrendingUp,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_NAV_ACCESS } from "@/lib/constants";
import type { UserRole } from "@/types/enums";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "leads", label: "Leads", href: "/leads", icon: Users },
  { key: "deals", label: "Deals", href: "/deals", icon: Briefcase },
  { key: "design-queue", label: "Design Queue", href: "/design-queue", icon: Palette },
  { key: "finances-revenue", label: "Revenue", href: "/finances/revenue", icon: DollarSign },
  { key: "finances-expenses", label: "Expenses", href: "/finances/expenses", icon: Receipt },
  { key: "finances-salary-splits", label: "Salary Splits", href: "/finances/salary-splits", icon: Split },
  { key: "finances-pnl", label: "P&L", href: "/finances/pnl", icon: TrendingUp },
  { key: "team", label: "Team", href: "/team", icon: UserCog },
];

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const accessibleKeys = ROLE_NAV_ACCESS[role] ?? [];
  const items = NAV_ITEMS.filter((item) => accessibleKeys.includes(item.key));

  return (
    <aside className="hidden w-60 flex-col border-r border-discord-border bg-discord-sidebar md:flex">
      <div className="flex h-16 items-center border-b border-discord-border px-4">
        <span className="text-lg font-semibold">Graphic CRM</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-discord-accent text-white"
                  : "text-muted-foreground hover:bg-discord-card hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
