import type { Metadata } from "next";
import { prisma } from "../../lib/prisma";
import { markRead, markUnread } from "../../actions/admin-inquiries";
import { DeleteInquiryButton } from "./DeleteInquiryButton";

export const metadata: Metadata = { title: "Inquiries — Console" };

export default async function InquiriesPage() {
  let submissions: Awaited<ReturnType<typeof prisma.contactSubmission.findMany>> = [];
  try {
    submissions = await prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" } });
  } catch { /* DB not yet migrated */ }

  const unread = submissions.filter((s) => !s.read).length;

  return (
    <div className="p-6 lg:p-10 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-zinc-950 tracking-tight mb-1">Contact Inquiries</h1>
          <p className="text-[13.5px] text-zinc-500 font-medium">
            {submissions.length} total received · <span className="font-bold text-blue-600">{unread} unread</span>
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-16 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="4" width="18" height="13" rx="2.5" stroke="#2563eb" strokeWidth="1.5"/><path d="M1 7.5l9 6 9-6" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <p className="text-[15px] font-bold text-zinc-900 mb-1">No contact inquiries yet</p>
          <p className="text-[13px] text-zinc-500">Messages submitted through your portfolio contact form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl border shadow-2xs overflow-hidden transition-all duration-150 ${
                !s.read ? "border-blue-200 ring-1 ring-blue-100" : "border-zinc-200/90"
              }`}
            >
              <div className="p-6">
                {/* Top Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar Bubble */}
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-[12px] font-bold text-white">
                        {s.name.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-zinc-950 truncate">{s.name}</p>
                        {!s.read && (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                            New Inquiry
                          </span>
                        )}
                      </div>
                      <a href={`mailto:${s.email}`} className="text-[12.5px] font-mono text-zinc-500 hover:text-blue-600 transition-colors">
                        {s.email}
                      </a>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <time className="text-[12px] font-mono text-zinc-500">
                      {new Date(s.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </time>
                    <p className="text-[10.5px] font-mono text-zinc-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-zinc-50/80 rounded-xl p-4 mb-5 border border-zinc-100">
                  <p className="text-[13.5px] text-zinc-800 leading-relaxed whitespace-pre-wrap">{s.message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:${s.email}?subject=Re: Portfolio Inquiry — Zaira Mundo`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 text-white text-[12.5px] font-semibold hover:bg-blue-600 transition-all duration-150 shadow-2xs"
                  >
                    <span>Reply via Email</span>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H5M9 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>

                  <form action={s.read ? markUnread.bind(null, s.id) : markRead.bind(null, s.id)}>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl border border-zinc-200/90 bg-white text-zinc-700 text-[12.5px] font-semibold hover:bg-zinc-100/80 transition-colors"
                    >
                      Mark as {s.read ? "Unread" : "Read"}
                    </button>
                  </form>

                  <DeleteInquiryButton id={s.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

