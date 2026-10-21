import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { requireSession } from "@/app/lib/session";
import { ConsoleShell } from "@/app/components/console/ConsoleShell";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";

// Admin pages are private: never indexed, even by a crawler that somehow got past sign-in.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const getUnreadInquiryCount = unstable_cache(
  () => prisma.inquiry.count({ where: { read: false } }),
  ["unread-inquiry-count"],
  { tags: [CACHE_TAGS.inquiries], revalidate: 30 }
);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  const unreadInquiries = await getUnreadInquiryCount();

  return (
    <ConsoleShell unreadInquiries={unreadInquiries}>
      {children}
    </ConsoleShell>
  );
}
