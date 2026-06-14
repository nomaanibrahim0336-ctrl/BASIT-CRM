"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import type { Team } from "@/types/database";

interface TopNavProps {
  teamMember: Team | null;
  onSignOut: () => void;
}

export function TopNav({ teamMember, onSignOut }: TopNavProps) {
  const initials = teamMember
    ? teamMember.fullName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/5 bg-discord-bg/70 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        {teamMember && (
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            {ROLE_LABELS[teamMember.role]}
          </span>
        )}
        <span className="hidden text-xs text-slate-500 md:inline">
          Powered by <span className="font-semibold text-slate-400">Bizmatic Solutions</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        {teamMember && (
          <>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-none text-white">
                {teamMember.fullName}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{teamMember.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white shadow-lg shadow-blue-900/40">
              {initials}
            </div>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSignOut}
          title="Sign out"
          className="text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
