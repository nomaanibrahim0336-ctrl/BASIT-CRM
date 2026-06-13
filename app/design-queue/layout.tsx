import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserRole } from "@/types/enums";

export default function DesignQueueLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell allowedRoles={[UserRole.ADMIN, UserRole.DESIGNER]}>
      {children}
    </DashboardShell>
  );
}
