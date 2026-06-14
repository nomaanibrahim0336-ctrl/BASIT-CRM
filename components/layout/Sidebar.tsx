"use client";

import Link from "next/link";
import Image from "next/image";
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
  Settings,
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
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const accessibleKeys = ROLE_NAV_ACCESS[role] ?? [];
  const items = NAV_ITEMS.filter((item) => accessibleKeys.includes(item.key));

  return (
    <aside className="hidden w-64 flex-col border-r border-white/5 bg-discord-sidebar/80 backdrop-blur-sm md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white shadow-lg shadow-blue-900/40">
          <Image src="/logo.jpg" alt="Bizmatic Solutions" width={36} height={36} className="h-full w-full object-cover" />
        </div>
        <div className="leading-tight">
          <span className="block text-sm font-semibold text-white">Graphic CRM</span>
          <span className="block text-[11px] text-slate-400">by Bizmatic Solutions</span>
        </div>
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
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-gradient text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-300" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-blue-300"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5 p-4">
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} Bizmatic Solutions
        </p>
      </div>
    </aside>
  );
}
