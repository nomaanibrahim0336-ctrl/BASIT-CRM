"use client";

import { useAuth } from "@/hooks/useAuth";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import type { UserRole } from "@/types/enums";

interface DashboardShellProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function DashboardShell({ allowedRoles, children }: DashboardShellProps) {
  const { teamMember, signOut } = useAuth();

  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-discord-bg">
        {teamMember && <Sidebar role={teamMember.role} />}
        <div className="flex flex-1 flex-col">
          <TopNav teamMember={teamMember} onSignOut={signOut} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}
