import { requireSession } from "@/app/lib/session";
import { ConsoleShell } from "@/app/components/console/ConsoleShell";
import { prisma } from "@/app/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const unreadInquiries = await prisma.inquiry.count({ where: { read: false } });

  return (
    <ConsoleShell email={session.user.email} unreadInquiries={unreadInquiries}>
      {children}
    </ConsoleShell>
  );
}
