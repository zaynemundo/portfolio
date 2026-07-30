import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "../../actions/admin-auth";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-zinc-900 mb-1">Account</h1>
        <p className="text-[14px] text-zinc-500">Your admin session and authentication settings.</p>
      </div>

      <div className="space-y-4">

        {/* Session info */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-4">Session</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">ZM</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-zinc-900">Zaira Mundo</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[12px] text-zinc-500">Active session</p>
              </div>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-3">Password</p>
          <p className="text-[13px] text-zinc-600 leading-relaxed mb-3">
            Your admin password is managed via the <code className="text-[12px] bg-zinc-100 px-1.5 py-0.5 rounded font-mono">ADMIN_PASSWORD</code> environment variable.
            To change it, update the variable in your hosting environment and redeploy.
          </p>
          <p className="text-[12px] text-zinc-400">
            Also set <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono">ADMIN_SECRET</code> to a secure random string — this is used as the session token.
          </p>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-3">Quick links</p>
          <div className="space-y-1">
            {[
              { href: "/admin/identity", label: "Portrait & CV",   desc: "Update your photo and resume file" },
              { href: "/admin/about",    label: "About text",      desc: "Edit your public bio" },
              { href: "/admin/links",    label: "Contact links",   desc: "Email, phone, LinkedIn, GitHub" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-zinc-50 transition-colors group"
              >
                <div>
                  <p className="text-[13px] font-medium text-zinc-900">{l.label}</p>
                  <p className="text-[11px] text-zinc-400">{l.desc}</p>
                </div>
                <svg className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Log out */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-3">Sign out</p>
          <p className="text-[13px] text-zinc-500 mb-4">Ends your current admin session. You will be redirected to the login page.</p>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
