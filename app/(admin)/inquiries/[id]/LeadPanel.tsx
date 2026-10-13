"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { createJobFromLead, setLeadNote, setLeadStage } from "@/app/actions/inquiries";
import { Select } from "@/app/(admin)/_components/Select";
import { cardClass } from "@/app/(admin)/_components/ui/Card";
import { routes } from "@/app/(admin)/_routes";
import { LEAD_STAGES } from "../LeadBoard";

const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";
const hintClass = "text-[12px] text-muted-foreground mt-1.5";

/** The side of a lead's page where it is worked: its stage, a one-line note, and turning it into a job. */
export function LeadPanel({ id, stage, note: savedNote, projectId, projectName }: { id: string; stage: string; note: string; projectId: string | null; projectName: string | null }) {
  const router = useRouter();
  const [note, setNote] = useState(savedNote);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveNote() {
    if (note.trim() === savedNote.trim()) return;
    startTransition(() => setLeadNote(id, note));
  }

  function createJob() {
    setError(null);
    startTransition(async () => {
      const result = await createJobFromLead(id);
      if (result.ok && result.id) router.push(routes.projects.item(result.id));
      else setError(result.error ?? "Couldn't create the job.");
    });
  }

  return (
    <aside className={`${cardClass} w-full lg:w-[300px] shrink-0 p-5 space-y-5`}>
      <div>
        <span className={labelClass}>Stage</span>
        <Select value={stage} onChange={(value) => startTransition(() => setLeadStage(id, value))} options={LEAD_STAGES} />
      </div>

      <div>
        <label htmlFor="leadNote" className={labelClass}>Note</label>
        <input
          id="leadNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          placeholder="e.g. Call booked Tue"
          className="w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
        />
        <p className={hintClass}>One line on where things stand. Shown on the lead&rsquo;s card; saves when you leave the field.</p>
      </div>

      <div>
        <span className={labelClass}>Job</span>
        {projectId ? (
          <Link href={routes.projects.item(projectId)} className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary hover:text-primary/80 transition-colors">
            <Briefcase size={14} />
            {projectName ?? "Open job"}
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={createJob}
              disabled={isPending}
              className="w-full rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Create job
            </button>
            <p className={hintClass}>Makes a client and a job from this lead, with the name, email and message carried across, and marks it as won.</p>
          </>
        )}
        {error && <p className="mt-2 text-[12.5px] text-destructive" role="alert">{error}</p>}
      </div>
    </aside>
  );
}
