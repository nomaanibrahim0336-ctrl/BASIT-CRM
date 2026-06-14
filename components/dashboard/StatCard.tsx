import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Accent = "blue" | "sky" | "indigo" | "cyan" | "violet";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  accent?: Accent;
}

const ACCENTS: Record<Accent, { badge: string; glow: string; ring: string }> = {
  blue: {
    badge: "from-blue-500 to-blue-700",
    glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(59,130,246,0.55)]",
    ring: "before:from-blue-400/70",
  },
  sky: {
    badge: "from-sky-400 to-sky-600",
    glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(56,189,248,0.5)]",
    ring: "before:from-sky-300/70",
  },
  indigo: {
    badge: "from-indigo-500 to-indigo-700",
    glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(99,102,241,0.5)]",
    ring: "before:from-indigo-400/70",
  },
  cyan: {
    badge: "from-cyan-400 to-cyan-600",
    glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(34,211,238,0.5)]",
    ring: "before:from-cyan-300/70",
  },
  violet: {
    badge: "from-violet-500 to-violet-700",
    glow: "group-hover:shadow-[0_18px_40px_-14px_rgba(139,92,246,0.5)]",
    ring: "before:from-violet-400/70",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent = "blue",
}: StatCardProps) {
  const styles = ACCENTS[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.06] bg-card/70 p-5 backdrop-blur-sm transition-all duration-300",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:to-transparent",
        "hover:-translate-y-0.5 hover:border-white/10",
        styles.glow,
        styles.ring
      )}
    >
      {/* faint corner glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40",
          styles.badge
        )}
      />

      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg shadow-black/30",
              styles.badge
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </div>
      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}
