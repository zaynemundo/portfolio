"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, Mail, Plus, Search, Trash2, X } from "lucide-react";
import { addLead, createJobFromLead, deleteInquiry, setLeadStage } from "@/app/actions/inquiries";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { StatusPill } from "@/app/(admin)/_components/ui/StatusPill";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { routes } from "@/app/(admin)/_routes";

export interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  note: string | null;
  stage: string;
  read: boolean;
  /** When it arrived, already formatted for display. */
  received: string;
  projectId: string | null;
}

export const LEAD_STAGES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUOTED", label: "Quoted" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];

/** The board's columns. Won and lost share the last one: both are leads that are finished with. */
const COLUMNS = [
  { title: "New", stages: ["NEW"], empty: "Nothing new." },
  { title: "Contacted", stages: ["CONTACTED"], empty: "No one waiting on a reply." },
  { title: "Quoted", stages: ["QUOTED"], empty: "No quotes out." },
  { title: "Won / lost", stages: ["WON", "LOST"], empty: "Nothing closed yet." },
];

const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";
const fieldClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";
const cardLink = "inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors disabled:opacity-50";

/** The "+ Add lead" button and its dialog, for a lead that didn't come through the website. */
export function AddLeadButton() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function show() {
    setDraft({ name: "", email: "", message: "" });
    setError(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await addLead(draft);
      if (result.ok) setOpen(false);
      else setError(result.error ?? "Couldn't add the lead.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="inline-flex items-center gap-1 rounded-full bg-foreground text-background text-[13px] font-semibold px-4 py-2 hover:bg-foreground/85 transition-colors"
      >
        <Plus size={14} />
        Add lead
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add lead">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="leadName" className={labelClass}>Name</label>
              <input id="leadName" required autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="leadEmail" className={labelClass}>Email (optional)</label>
              <input id="leadEmail" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="leadMessage" className={labelClass}>What they want</label>
            <textarea id="leadMessage" rows={4} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} className={`${fieldClass} resize-y`} />
          </div>
          {error && <p className="text-[12.5px] text-destructive" role="alert">{error}</p>}
          <DialogActions onCancel={() => setOpen(false)} pending={isPending} submitLabel="Add lead" />
        </form>
      </Modal>
    </>
  );
}

/** Leads as a pipeline: one column per stage, a card per lead. A card opens the lead; its "…" moves it to another stage. */
export function LeadBoard({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const term = query.trim().toLowerCase();
  const shown = term ? leads.filter((lead) => `${lead.name} ${lead.email} ${lead.message} ${lead.note ?? ""}`.toLowerCase().includes(term)) : leads;

  function move(lead: Lead, stage: string) {
    startTransition(() => setLeadStage(lead.id, stage));
  }

  function remove(lead: Lead) {
    if (!window.confirm(`Delete the lead from ${lead.name}? This can't be undone.`)) return;
    startTransition(() => deleteInquiry(lead.id));
  }

  function createJob(lead: Lead) {
    setError(null);
    startTransition(async () => {
      const result = await createJobFromLead(lead.id);
      if (result.ok && result.id) router.push(routes.projects.item(result.id));
      else setError(result.error ?? "Couldn't create the job.");
    });
  }

  return (
    <div>
      <div className="relative mb-4 w-72 max-w-full">
        <Search size={14} aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search leads…"
          aria-label="Search leads"
          style={{ outline: "none" }}
          className="w-full h-9 rounded-full bg-card border-0 ring-1 ring-border pl-9 pr-9 text-[12.5px] text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring transition-shadow"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-[12.5px] text-destructive" role="alert">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 items-start">
        {COLUMNS.map((column) => {
          const cards = shown.filter((lead) => column.stages.includes(lead.stage));
          return (
            <section key={column.title} aria-label={column.title} className="rounded-2xl bg-muted/60 p-2.5">
              <h2 className="flex items-center gap-2 px-2 py-1.5 text-[12.5px] font-semibold text-foreground">
                {column.title}
                <span className="font-medium tabular-nums text-muted-foreground">{cards.length}</span>
              </h2>

              {cards.length === 0 ? (
                <p className="px-2 py-4 text-[12.5px] text-muted-foreground">{term ? "No match." : column.empty}</p>
              ) : (
                <ul className="space-y-2">
                  {cards.map((lead) => {
                    const closed = lead.stage === "WON" || lead.stage === "LOST";
                    return (
                      <li key={lead.id} className={`${cardClass} relative p-3 hover:border-primary/40 transition-colors`}>
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            {/* Covers the card, so a click anywhere on it opens the lead. */}
                            <Link href={routes.inquiries.item(lead.id)} className="text-[13.5px] font-semibold text-foreground after:absolute after:inset-0">
                              {lead.name}
                            </Link>
                            {!lead.read && <span className="ml-2 align-middle rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">New</span>}
                            <p className="mt-0.5 line-clamp-2 text-[12.5px] text-muted-foreground">{lead.note || lead.message || "No message."}</p>
                          </div>
                          <RowMenu disabled={isPending}>
                            {LEAD_STAGES.filter((stage) => stage.value !== lead.stage).map((stage) => (
                              <RowMenuItem key={stage.value} onClick={() => move(lead, stage.value)} icon={<ArrowRight size={14} />}>
                                {stage.value === "WON" || stage.value === "LOST" ? `Mark as ${stage.label.toLowerCase()}` : `Move to ${stage.label}`}
                              </RowMenuItem>
                            ))}
                            <RowMenuItem onClick={() => remove(lead)} danger icon={<Trash2 size={14} />}>
                              Delete
                            </RowMenuItem>
                          </RowMenu>
                        </div>

                        <div className="relative z-10 mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          {closed && <StatusPill tone={lead.stage === "WON" ? "positive" : "negative"}>{lead.stage === "WON" ? "Won" : "Lost"}</StatusPill>}
                          {lead.projectId ? (
                            <Link href={routes.projects.item(lead.projectId)} className={cardLink}>
                              <Briefcase size={12} />
                              Open job
                            </Link>
                          ) : (
                            <>
                              {!closed && lead.email && (
                                <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: your enquiry")}`} className={cardLink}>
                                  <Mail size={12} />
                                  Reply
                                </a>
                              )}
                              {lead.stage !== "LOST" && (
                                <button type="button" onClick={() => createJob(lead)} disabled={isPending} className={cardLink}>
                                  <Briefcase size={12} />
                                  Create job
                                </button>
                              )}
                            </>
                          )}
                          <span className="ml-auto text-[11.5px] text-muted-foreground">{lead.received}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
