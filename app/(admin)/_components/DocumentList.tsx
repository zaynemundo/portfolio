"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { addDocument, deleteDocument, setDocumentJob, uploadDocument } from "@/app/actions/documents";
import { Select } from "@/app/(admin)/_components/Select";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { DocumentDialog, ShareBadge, type ViewableDocument } from "@/app/(admin)/_components/DocumentDialog";
import { routes } from "@/app/(admin)/_routes";

/* Documents are filed under a client. Each one can also be put on one of
 * that client's jobs, so a job shows its own list while the client keeps
 * the full set. */

export interface ClientDocument extends ViewableDocument {
  /** The job this document is on, if any. */
  projectId: string | null;
  /** When it was added, already formatted for display. */
  added: string;
}

interface JobOption {
  id: string;
  name: string;
}

const UPLOAD_BUTTON =
  "inline-flex items-center gap-1.5 rounded-lg border border-border text-foreground/80 text-[12.5px] font-medium px-3 py-1.5 hover:bg-card transition-colors shrink-0 cursor-pointer";
const ROW_SELECT =
  "w-full flex items-center justify-between gap-2 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[12.5px] text-foreground/90 hover:bg-secondary transition-colors";
const NO_JOB = "";

const FIELD =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";
const LABEL = "block text-[12px] font-medium text-foreground/80 mb-1.5";

/**
 * "Add document" button plus its dialog: choose the file, name it, and
 * (from a client's list) optionally put it on one of their jobs. From a job
 * page the job is already known, so `projectId` is passed and no job is asked for.
 */
function AddDocumentButton({
  label, clientId, projectId, jobs = [],
}: {
  label: string;
  clientId?: string | null;
  /** Fixed job, when adding from a job page. */
  projectId?: string;
  /** Jobs to choose from, when adding from a client's list. */
  jobs?: JobOption[];
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState(NO_JOB);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openDialog() {
    setFile(null);
    setName("");
    setJobId(NO_JOB);
    setError(null);
    setOpen(true);
  }

  function chooseFile(next: File | undefined) {
    setFile(next ?? null);
    // Suggest the file's own name, without its extension, until a name is typed.
    if (next && !name.trim()) setName(next.name.replace(/\.[^.]+$/, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setError(null);
    setIsSaving(true);

    const formData = new FormData();
    formData.set("file", file);
    const uploaded = await uploadDocument(formData);
    if (!uploaded.ok || !uploaded.url) {
      setError(uploaded.error ?? "Upload failed.");
      setIsSaving(false);
      return;
    }

    const added = await addDocument(name.trim() || file.name, uploaded.url, {
      clientId,
      projectId: projectId ?? (jobId === NO_JOB ? null : jobId),
    });
    setIsSaving(false);
    if (!added.ok) {
      setError(added.error ?? "Something went wrong.");
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <button type="button" onClick={openDialog} className={UPLOAD_BUTTON}>
        <Plus size={13} />
        {label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="documentFile" className={LABEL}>File</label>
            <input
              id="documentFile"
              type="file"
              onChange={(e) => chooseFile(e.target.files?.[0])}
              className={`${FIELD} file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-[12.5px] file:font-medium file:text-foreground`}
            />
            <p className="text-[11.5px] text-muted-foreground mt-1.5">PDF, image or any file up to 15MB.</p>
          </div>
          <div>
            <label htmlFor="documentName" className={LABEL}>Name</label>
            <input id="documentName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Project brief" className={FIELD} />
          </div>
          {!projectId && jobs.length > 0 && (
            <div>
              <span className={LABEL}>Job (optional)</span>
              <Select
                value={jobId}
                onChange={setJobId}
                options={[{ value: NO_JOB, label: "Not on a job" }, ...jobs.map((j) => ({ value: j.id, label: j.name }))]}
              />
              <p className="text-[11.5px] text-muted-foreground mt-1.5">Pick a job to show this document on that job&rsquo;s page too.</p>
            </div>
          )}
          {error && <p className="text-[12.5px] text-destructive" role="alert">{error}</p>}
          <DialogActions onCancel={() => setOpen(false)} pending={isSaving} submitLabel="Add document" />
        </form>
      </Modal>
    </>
  );
}

/** Every document belonging to one client, with a choice of job on each row. */
export function ClientDocuments({
  clientId, documents, jobs, title = "Documents", titleHref, hint,
}: {
  clientId: string;
  documents: ClientDocument[];
  jobs: JobOption[];
  title?: string;
  /** Makes the title a link, e.g. to the client's page from the Documents overview. */
  titleHref?: string;
  hint?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<ClientDocument | null>(null);
  const [isPending, startTransition] = useTransition();

  function assign(doc: ClientDocument, projectId: string) {
    setError(null);
    startTransition(async () => {
      const result = await setDocumentJob(doc.id, projectId === NO_JOB ? null : projectId);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  function remove(doc: ClientDocument) {
    if (!window.confirm(`Delete "${doc.name}"? The file is removed for good.`)) return;
    startTransition(() => deleteDocument(doc.id));
  }

  const jobOptions = [{ value: NO_JOB, label: "Not on a job" }, ...jobs.map((j) => ({ value: j.id, label: j.name }))];

  return (
    <section className="rounded-xl border border-border bg-card/40">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border">
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold text-foreground truncate">
            {titleHref ? (
              <Link href={titleHref} className="hover:text-primary transition-colors">{title}</Link>
            ) : (
              title
            )}
            <span className="ml-2 font-normal text-muted-foreground tabular-nums">{documents.length}</span>
          </h2>
          {hint && <p className="text-[12px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
        <AddDocumentButton label="Add document" clientId={clientId} jobs={jobs} />
      </div>

      {documents.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-muted-foreground">No documents yet.</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 border-b border-border/70 last:border-b-0">
              <button
                type="button"
                onClick={() => setViewing(doc)}
                title="Preview and share"
                className="flex items-center gap-2 min-w-0 flex-1 basis-56 text-left text-[13.5px] font-medium text-foreground hover:text-primary transition-colors"
              >
                <FileIcon />
                <span className="truncate">{doc.name}</span>
              </button>
              <ShareBadge doc={doc} />
              <span className="text-[12px] text-muted-foreground whitespace-nowrap">{doc.added}</span>
              {jobs.length > 0 && (
                <div className="w-48">
                  <Select value={doc.projectId ?? NO_JOB} onChange={(value) => assign(doc, value)} options={jobOptions} className={ROW_SELECT} />
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(doc)}
                disabled={isPending}
                className="text-[12.5px] font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="px-5 py-3 text-[12.5px] text-destructive border-t border-border" role="alert">{error}</p>}
      {viewing && <DocumentDialog key={viewing.id} doc={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}

export type JobDocument = ViewableDocument;

/** A client document that could be put on this job. */
export interface AvailableDocument {
  id: string;
  name: string;
  /** Set when it is currently on another of the client's jobs; choosing it moves it here. */
  otherJobName: string | null;
}

/** The documents on one job: pick from the client's documents, or upload a new one. */
export function JobDocuments({
  projectId, client, documents, available,
}: {
  projectId: string;
  client: { id: string; slug: string | null; name: string } | null;
  documents: JobDocument[];
  available: AvailableDocument[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<JobDocument | null>(null);
  const [isPending, startTransition] = useTransition();

  function attach(documentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await setDocumentJob(documentId, projectId);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  function remove(doc: JobDocument) {
    // With a client, the file stays in the client's documents; without one this job is its only home.
    if (client) {
      startTransition(async () => {
        await setDocumentJob(doc.id, null);
      });
      return;
    }
    if (!window.confirm(`Delete "${doc.name}"? The file is removed for good.`)) return;
    startTransition(() => deleteDocument(doc.id));
  }

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-[13px] font-semibold text-foreground">
          Documents
          <span className="ml-2 font-normal text-muted-foreground tabular-nums">{documents.length}</span>
        </h2>
        <AddDocumentButton label="Upload new" clientId={client?.id} projectId={projectId} />
      </div>

      {documents.length === 0 ? (
        <p className="text-[12.5px] text-muted-foreground/70 mb-3">No documents on this job yet.</p>
      ) : (
        <ul className="mb-3">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 py-2 border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => setViewing(doc)}
                title="Preview and share"
                className="flex items-center gap-2 min-w-0 flex-1 text-left text-[12.5px] text-foreground/80 hover:text-foreground transition-colors"
              >
                <FileIcon />
                <span className="truncate">{doc.name}</span>
              </button>
              <ShareBadge doc={doc} />
              <button
                type="button"
                onClick={() => remove(doc)}
                disabled={isPending}
                className="shrink-0 text-[12px] font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              >
                {client ? "Remove" : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {client && available.length > 0 && (
        <Select
          value=""
          onChange={attach}
          placeholder={`Add from ${client.name}'s documents…`}
          options={available.map((d) => ({ value: d.id, label: d.otherJobName ? `${d.name} (now on ${d.otherJobName})` : d.name }))}
        />
      )}

      <p className="text-[11.5px] text-muted-foreground mt-3">
        {client ? (
          <>
            Files stay in{" "}
            <Link href={routes.clients.item(client.slug ?? client.id)} className="text-primary hover:text-primary/80 transition-colors">
              {client.name}&rsquo;s documents
            </Link>{" "}
            when removed from this job.
          </>
        ) : (
          "Choose a client in the job details to pick from their documents."
        )}
      </p>

      {error && <p className="text-[11.5px] text-destructive mt-2" role="alert">{error}</p>}
      {viewing && <DocumentDialog key={viewing.id} doc={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
      <path d="M5.5 3h6l3 3v11a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M11.5 3v3h3" />
    </svg>
  );
}
