"use client";

import { useTransition } from "react";
import { ArrowRight, RotateCcw, Trash2 } from "lucide-react";
import { deleteInquiry, setLeadStage } from "@/app/actions/inquiries";
import { routes } from "@/app/(admin)/_routes";
import { PageTable } from "@/app/(admin)/_components/ui/DataTable";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { LEAD_STAGES } from "../LeadBoard";

interface ArchivedLead {
  id: string;
  name: string;
  email: string;
  summary: string;
  received: string;
  receivedAt: number;
}

/** The lost leads, each with "Bring back" to put it on the board again. */
export function ArchivedLeads({ leads }: { leads: ArchivedLead[] }) {
  const [isPending, startTransition] = useTransition();

  function remove(lead: ArchivedLead) {
    if (!window.confirm(`Delete the lead from ${lead.name}? This can't be undone.`)) return;
    startTransition(() => deleteInquiry(lead.id));
  }

  return (
    <PageTable
      searchPlaceholder="Search the archive…"
      columns={[{ label: "Lead" }, { label: "What they wanted" }, { label: "Received" }, { label: "" }]}
      rows={leads.map((lead) => ({
        id: lead.id,
        href: routes.inquiries.item(lead.id),
        search: `${lead.name} ${lead.email} ${lead.summary}`,
        sort: [lead.name, lead.summary || null, lead.receivedAt, undefined],
        cells: (
          <>
            <td className="px-4 py-3">
              <span className="block text-[13.5px] font-semibold text-foreground">{lead.name}</span>
              {lead.email && <span className="block text-[12px] text-muted-foreground">{lead.email}</span>}
            </td>
            <td className="max-w-md px-4 py-3 text-[13px] text-foreground/80">
              <span className="line-clamp-2">{lead.summary || <span className="text-muted-foreground">—</span>}</span>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-[13px] text-muted-foreground">{lead.received}</td>
            <td className="px-4 py-3 text-right">
              <span className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startTransition(() => setLeadStage(lead.id, "NEW"))}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={12} />
                  Bring back
                </button>
                <RowMenu disabled={isPending}>
                  {LEAD_STAGES.filter((s) => s.value !== "LOST").map((s) => (
                    <RowMenuItem key={s.value} onClick={() => startTransition(() => setLeadStage(lead.id, s.value))} icon={<ArrowRight size={14} />}>
                      {s.value === "WON" ? "Mark as won" : `Back to ${s.label}`}
                    </RowMenuItem>
                  ))}
                  <RowMenuItem onClick={() => remove(lead)} danger icon={<Trash2 size={14} />}>
                    Delete
                  </RowMenuItem>
                </RowMenu>
              </span>
            </td>
          </>
        ),
      }))}
    />
  );
}
