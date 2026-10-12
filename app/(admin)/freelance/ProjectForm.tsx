"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createFreelanceProject,
  updateFreelanceProject,
  deleteFreelanceProject,
  archiveFreelanceProject,
  type FreelanceProjectFormData,
} from "@/app/actions/freelance";
import { ClientSelect, type ClientOption } from "@/app/(admin)/_components/ClientSelect";
import { Select } from "@/app/(admin)/_components/Select";
import { Modal } from "@/app/(admin)/_components/Modal";
import { routes } from "@/app/(admin)/_routes";

const SELECT_CLASS = "w-full flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 hover:bg-secondary transition-colors";

interface Props {
  projectId?: string;
  initial?: Partial<FreelanceProjectFormData> & { archived?: boolean };
  clients: ClientOption[];
  onClientCreated?: (client: ClientOption) => void;
  /** Called after the project is deleted, so the parent can e.g. navigate away. */
  onDeleted?: () => void;
  /** True right after a job is created, so its details stay in the page until "Done". */
  setup?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const EDIT_BUTTON =
  "shrink-0 rounded-lg border border-border text-foreground/80 text-[12.5px] font-medium px-3 py-1.5 hover:bg-card transition-colors";

const HEADER_SELECT_CLASS =
  "w-full flex items-center justify-between gap-2 rounded-full bg-secondary/60 px-3.5 h-8 text-[12.5px] font-medium text-foreground/90 hover:bg-secondary transition-colors";

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not started" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On hold" },
  { value: "COMPLETED", label: "Completed" },
];

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not started",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

/** Apple-Notes-style: no separate edit mode, no Save button — every change autosaves. */
export function ProjectForm({ projectId, initial, clients, onClientCreated, onDeleted, setup = false }: Props) {
  const router = useRouter();
  const [id, setId] = useState(projectId ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [nextAction, setNextAction] = useState(initial?.nextAction ?? "");
  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "NOT_STARTED");
  const [rateAmount, setRateAmount] = useState(initial?.rateAmount ?? "");
  const [rateCurrency, setRateCurrency] = useState(initial?.rateCurrency ?? "AED");
  const [rateType, setRateType] = useState(initial?.rateType ?? "");
  // Briefs and contracts now live in the job's Documents list; an older single attachment is kept as saved.
  const attachmentUrl = initial?.attachmentUrl ?? "";
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");
  const [endDate, setEndDate] = useState(initial?.endDate ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [archived, setArchived] = useState(initial?.archived ?? false);
  const [saveStatus, setStatusMsg] = useState<SaveStatus>("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  // A job's settings are edited in a dialog; while it's first being set up they sit in the page instead.
  const [detailsOpen, setDetailsOpen] = useState(false);
  const showInline = !projectId || setup;
  const isFirstRender = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!name.trim()) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setStatusMsg("saving");
      const data: FreelanceProjectFormData = {
        name, nextAction, clientId, status, description, rateAmount, rateCurrency, rateType, attachmentUrl, startDate, endDate,
      };
      const result = id ? await updateFreelanceProject(id, data) : await createFreelanceProject(data);
      if (!result.ok) {
        setStatusMsg("error");
        return;
      }
      if (!id && result.id) {
        setId(result.id);
        router.replace(`${routes.projects.item(result.id)}?setup=1`);
      }
      setStatusMsg("saved");
      router.refresh();
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, nextAction, clientId, status, rateAmount, rateCurrency, rateType, attachmentUrl, startDate, endDate, description]);

  function toggleArchive() {
    if (!id) return;
    const next = !archived;
    setArchived(next);
    archiveFreelanceProject(id, next).then(() => router.refresh());
  }

  function handleDelete() {
    if (!id) return;
    if (!window.confirm(`Delete "${name}" and all its tasks? This can't be undone.`)) return;
    setIsDeleting(true);
    deleteFreelanceProject(id).then(() => {
      if (onDeleted) onDeleted();
      else router.push(routes.projects.list);
    });
  }

  const summary = [
    clients.find((c) => c.id === clientId)?.name,
    STATUS_LABELS[status],
    rateAmount ? `${rateCurrency} ${Number(rateAmount).toLocaleString()}${rateType ? ` ${rateType.toLowerCase()}` : ""}` : null,
    startDate || endDate ? `${startDate || "…"} to ${endDate || "…"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const detailFields = (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] text-muted-foreground/70 mb-1">Client</label>
          <ClientSelect
            value={clientId}
            onChange={setClientId}
            clients={clients}
            onClientCreated={onClientCreated}
            className={SELECT_CLASS}
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground/70 mb-1">Status</label>
          <Select
            value={status}
            onChange={setStatus}
            className={SELECT_CLASS}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-[11px] text-muted-foreground/70 mb-1">Rate (optional)</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={rateAmount}
            onChange={(e) => setRateAmount(e.target.value)}
            placeholder="Amount"
            style={{ outline: "none" }}
            className="rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 placeholder:text-muted-foreground/70"
          />
          <input
            value={rateCurrency}
            onChange={(e) => setRateCurrency(e.target.value)}
            placeholder="AED"
            style={{ outline: "none" }}
            className="rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 placeholder:text-muted-foreground/70"
          />
          <Select
            value={rateType}
            onChange={setRateType}
            className={SELECT_CLASS}
            placeholder="Type…"
            options={[
              { value: "FIXED", label: "Fixed" },
              { value: "HOURLY", label: "Hourly" },
              { value: "RETAINER", label: "Retainer" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] text-muted-foreground/70 mb-1">Start date (optional)</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ outline: "none" }}
            className="w-full rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90"
          />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground/70 mb-1">End date (optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ outline: "none" }}
            className="w-full rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90"
          />
        </div>
      </div>
    </>
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Job name"
          aria-label="Job name"
          style={{ outline: "none" }}
          className="w-full text-[21px] font-semibold text-foreground placeholder:text-muted-foreground/70 bg-transparent"
        />
        {id && (
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <div className="w-36">
              <Select value={status} onChange={setStatus} options={STATUS_OPTIONS} className={HEADER_SELECT_CLASS} />
            </div>
            <button
              type="button"
              onClick={toggleArchive}
              aria-label={archived ? "Unarchive" : "Archive"}
              title={archived ? "Unarchive" : "Archive"}
              className={`h-8 w-8 flex items-center justify-center rounded-full bg-secondary/60 transition-colors ${
                archived ? "text-success" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <ArchiveIcon />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Delete job"
              title="Delete job"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="nextAction" className="block text-[11px] text-muted-foreground/70 mb-1">Next action</label>
        <input
          id="nextAction"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          placeholder="What happens next? e.g. Waiting for client feedback"
          style={{ outline: "none" }}
          className="w-full rounded-lg bg-secondary/60 px-3 py-2 text-[13.5px] text-foreground/90 placeholder:text-muted-foreground/70"
        />
      </div>

      {showInline ? (
        <div className="rounded-xl border border-border bg-card/40 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-foreground">Job details</h2>
            {id && (
              <button type="button" onClick={() => router.replace(routes.projects.item(id))} className={EDIT_BUTTON}>
                Done
              </button>
            )}
          </div>
          {detailFields}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 mb-6">
          <span className="text-[13px] font-semibold text-foreground shrink-0">Job details</span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted-foreground">{summary || "Nothing set yet"}</span>
          <button type="button" onClick={() => setDetailsOpen(true)} className={EDIT_BUTTON}>
            Edit
          </button>
        </div>
      )}

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Job details">
        {detailFields}
        <p className="text-[12px] text-muted-foreground mb-4">Changes save as you make them.</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setDetailsOpen(false)}
            className="rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>

      <label htmlFor="jobNotes" className="block text-[13px] font-semibold text-foreground mb-2">Notes</label>
      <textarea
        id="jobNotes"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief, scope, anything worth remembering about this job…"
        className="block w-full rounded-xl bg-card/40 px-4 py-3 text-[14px] leading-relaxed text-foreground/90 placeholder:text-muted-foreground/70 resize-y"
      />

      <p className="text-[11.5px] text-muted-foreground/70 mt-3">
        {saveStatus === "saving" && "Saving…"}
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "error" && <span className="text-destructive">Couldn&apos;t save — check your connection.</span>}
      </p>
    </div>
  );
}

function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 7.5V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.2 10.5h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8 4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V5h3.25a.75.75 0 0 1 0 1.5h-.482l-.78 9.36A2 2 0 0 1 11.995 17.7H8.005a2 2 0 0 1-1.993-1.84l-.78-9.36H4.75a.75.75 0 0 1 0-1.5H8v-.5Zm1.5.5h1V5h-1v-0Zm-2.223 1.5.766 9.24a.5.5 0 0 0 .498.46h3.99a.5.5 0 0 0 .498-.46l.766-9.24H7.277Z" />
    </svg>
  );
}
