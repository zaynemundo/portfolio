import { unstable_cache } from "next/cache";
import { requireSession } from "@/app/lib/session";
import { ConsoleShell } from "@/app/components/console/ConsoleShell";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

const getUnreadInquiryCount = unstable_cache(
  () => prisma.inquiry.count({ where: { read: false } }),
  ["unread-inquiry-count"],
  { tags: [CACHE_TAGS.inquiries], revalidate: 30 }
);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const unreadInquiries = await getUnreadInquiryCount();

  return (
    <ConsoleShell email={session.user.email} unreadInquiries={unreadInquiries}>
      {children}
    </ConsoleShell>
  );
}
