import Link from "next/link";
import { requireSession } from "@/app/lib/session";
import { LogoutButton } from "./LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard/blog" className="flex items-center gap-2.5">
            <span className="text-[13px] font-extrabold tracking-tight text-white">ZM</span>
            <span className="h-4 w-px bg-zinc-800" aria-hidden="true" />
            <span className="text-[13px] font-medium text-zinc-300">Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[12.5px] text-zinc-500">{session.user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
