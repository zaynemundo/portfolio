import { requireSession } from "@/app/lib/session";
import { ConsoleShell } from "@/app/components/console/ConsoleShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return <ConsoleShell email={session.user.email}>{children}</ConsoleShell>;
}
