"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArrowRight, Briefcase, Mail, Plus, Search, Trash2, X } from "lucide-react";
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

/** The board's columns, one stage each. Lost leads leave the board for the Archive page. */
const COLUMNS = [
  { stage: "NEW", title: "New", empty: "Nothing new." },
  { stage: "CONTACTED", title: "Contacted", empty: "No one waiting on a reply." },
  { stage: "QUOTED", title: "Quoted", empty: "No quotes out." },
  { stage: "WON", title: "Won", empty: "Nothing won yet." },
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
              <input id="leadEmail" type="email" autoComplete="off" data-lpignore="true" data-1p-ignore="" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={fieldClass} />
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

/**
 * Leads as a pipeline: one column per stage, a card per lead. Drag a card to
 * another column (or onto Archive) to move it; its "…" menu does the same.
 * A card opens the lead.
 */
export function LeadBoard({ leads, archived }: { leads: Lead[]; archived: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Where a card was just dropped, shown straight away while the server catches up.
  const [moved, setMoved] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const stageOf = (lead: Lead) => moved[lead.id] ?? lead.stage;
  const term = query.trim().toLowerCase();
  const shown = (term ? leads.filter((lead) => `${lead.name} ${lead.email} ${lead.message} ${lead.note ?? ""}`.toLowerCase().includes(term)) : leads).filter(
    (lead) => stageOf(lead) !== "LOST",
  );

  function move(lead: Lead, stage: string) {
    if (stageOf(lead) === stage) return;
    setMoved((m) => ({ ...m, [lead.id]: stage }));
    startTransition(() => setLeadStage(lead.id, stage));
  }

  /** Drop-target props for a column or the Archive strip. */
  function dropZone(stage: string) {
    return {
      onDragOver: (e: React.DragEvent) => {
        if (!dragging) return;
        e.preventDefault();
        setOver(stage);
      },
      onDragLeave: () => setOver((o) => (o === stage ? null : o)),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const lead = leads.find((l) => l.id === dragging);
        if (lead) move(lead, stage);
        setDragging(null);
        setOver(null);
      },
    };
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-72 max-w-full">
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
        {/* While a card is being dragged this is where it can be dropped to archive it as lost; otherwise a link to the archive. */}
        {dragging ? (
          <div
            {...dropZone("LOST")}
            className={`flex h-9 items-center gap-1.5 rounded-full border border-dashed px-4 text-[12.5px] font-semibold transition-colors ${
              over === "LOST" ? "border-negative bg-negative/10 text-negative" : "border-border text-muted-foreground"
            }`}
          >
            <Archive size={13} />
            Drop here to archive as lost
          </div>
        ) : (
          <Link href={routes.inquiries.archive} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold text-muted-foreground hover:bg-card hover:text-foreground transition-colors">
            <Archive size={13} />
            Archive{archived > 0 && <span className="tabular-nums">({archived})</span>}
          </Link>
        )}
      </div>

      {error && <p className="mb-3 text-[12.5px] text-destructive" role="alert">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 items-start">
        {COLUMNS.map((column) => {
          const cards = shown.filter((lead) => stageOf(lead) === column.stage);
          return (
            <section
              key={column.stage}
              aria-label={column.title}
              {...dropZone(column.stage)}
              className={`min-h-32 rounded-2xl p-2.5 transition-colors ${over === column.stage ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted/60"}`}
            >
              <h2 className="flex items-center gap-2 px-2 py-1.5 text-[12.5px] font-semibold text-foreground">
                {column.title}
                <span className="font-medium tabular-nums text-muted-foreground">{cards.length}</span>
              </h2>

              {cards.length === 0 ? (
                <p className="px-2 py-4 text-[12.5px] text-muted-foreground">{term ? "No match." : column.empty}</p>
              ) : (
                <ul className="space-y-2">
                  {cards.map((lead) => {
                    const stage = stageOf(lead);
                    const closed = stage === "WON";
                    return (
                      <li
                        key={lead.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move";
                          setDragging(lead.id);
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setOver(null);
                        }}
                        className={`${cardClass} relative cursor-grab p-3 hover:border-primary/40 transition-[opacity,border-color] active:cursor-grabbing ${dragging === lead.id ? "opacity-40" : ""}`}
                      >
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
                            {LEAD_STAGES.filter((s) => s.value !== stage && s.value !== "LOST").map((s) => (
                              <RowMenuItem key={s.value} onClick={() => move(lead, s.value)} icon={<ArrowRight size={14} />}>
                                {s.value === "WON" ? "Mark as won" : `Move to ${s.label}`}
                              </RowMenuItem>
                            ))}
                            <RowMenuItem onClick={() => move(lead, "LOST")} icon={<Archive size={14} />}>
                              Archive as lost
                            </RowMenuItem>
                            <RowMenuItem onClick={() => remove(lead)} danger icon={<Trash2 size={14} />}>
                              Delete
                            </RowMenuItem>
                          </RowMenu>
                        </div>

                        <div className="relative z-10 mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          {closed && <StatusPill tone="positive">Won</StatusPill>}
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
                              <button type="button" onClick={() => createJob(lead)} disabled={isPending} className={cardLink}>
                                <Briefcase size={12} />
                                Create job
                              </button>
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
