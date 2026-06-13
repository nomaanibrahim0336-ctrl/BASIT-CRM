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
  return (
    <header className="flex h-16 items-center justify-between border-b border-discord-border bg-discord-card px-4 md:px-6">
      <div>
        {teamMember && (
          <p className="text-sm text-muted-foreground">
            {ROLE_LABELS[teamMember.role]}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {teamMember && (
          <div className="text-right">
            <p className="text-sm font-medium leading-none">{teamMember.fullName}</p>
            <p className="text-xs text-muted-foreground">{teamMember.email}</p>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
