import { DashboardShell } from "@/components/layout/DashboardShell";
import { UserRole } from "@/types/enums";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell allowedRoles={[UserRole.ADMIN]}>{children}</DashboardShell>
  );
}
