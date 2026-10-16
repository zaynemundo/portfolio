"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { addDocument, deleteDocument, setDocumentJob, uploadDocument } from "@/app/actions/documents";
import { Select } from "@/app/(admin)/_components/Select";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { DocumentDialog, ShareBadge, shareState, type ViewableDocument } from "@/app/(admin)/_components/DocumentDialog";
import { routes } from "@/app/(admin)/_routes";
import { Card, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";
import { pageActionClass } from "@/app/(admin)/_components/PageHeader";
import { RequiredMark } from "@/app/(admin)/_components/Section";

/* Documents are filed under a client. Each one can also be put on one of
 * that client's jobs, so a job shows its own list while the client keeps
 * the full set. */

export interface ClientDocument extends ViewableDocument {
  /** The job this document is on, if any. */
  projectId: string | null;
  /** When it was added, already formatted for display. */
  added: string;
  /** The same moment as an ISO string, for sorting. */
  addedAt: string;
  /** Which client it is filed under. Only needed for a list covering several clients. */
  clientId?: string | null;
  /** The job's name, for a document whose job can't be looked up from its client (it has no client yet). */
  projectName?: string | null;
}

/** A client as the all-clients list needs it: its name, its page, and the jobs its documents can go on. */
export interface DocumentClient {
  id: string;
  slug: string | null;
  name: string;
  jobs: JobOption[];
}

interface JobOption {
  id: string;
  name: string;
}

const UPLOAD_BUTTON = `${cardActionClass} inline-flex shrink-0 items-center gap-1.5`;
const NO_JOB = "";
/** Filter value for documents with no job, or no client (a filter value can't be empty). */
const NONE = "none";
const SHARING_OPTIONS = [
  { value: "shared", label: "Shared" },
  { value: "private", label: "Private" },
  { value: "expired", label: "Link expired" },
];

const FIELD =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";
const LABEL = "block text-[12px] font-medium text-foreground/80 mb-1.5";

/**
 * "Add document" button plus its dialog: choose the file, name it, and
 * (from a client's list) optionally put it on one of their jobs. From a job
 * page the job is already known, so `projectId` is passed and no job is asked for.
 * From the all-clients list neither is known, so `clients` is passed and the
 * client is asked for first.
 */
export function AddDocumentButton({
  label, clientId, projectId, jobs = [], clients, primary,
}: {
  label: string;
  /** The page's main action (black pill in the page header) rather than a small button in a card. */
  primary?: boolean;
  clientId?: string | null;
  /** Fixed job, when adding from a job page. */
  projectId?: string;
  /** Jobs to choose from, when adding from a client's list. */
  jobs?: JobOption[];
  /** Clients to choose from, when adding from the all-clients list. */
  clients?: DocumentClient[];
}) {
  const [open, setOpen] = useState(false);
  const [chosenClientId, setChosenClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [jobId, setJobId] = useState(NO_JOB);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openDialog() {
    setFile(null);
    setName("");
    setJobId(NO_JOB);
    setChosenClientId(clients?.length === 1 ? clients[0].id : "");
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
    if (clients && !chosenClientId) {
      setError("Choose the client this document is for.");
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
      clientId: clients ? chosenClientId : clientId,
      projectId: projectId ?? (jobId === NO_JOB ? null : jobId),
    });
    setIsSaving(false);
    if (!added.ok) {
      setError(added.error ?? "Something went wrong.");
      return;
    }
    setOpen(false);
  }

  const jobChoices = clients ? (clients.find((c) => c.id === chosenClientId)?.jobs ?? []) : jobs;

  return (
    <>
      {primary ? (
        <button type="button" onClick={openDialog} className={pageActionClass}>
          + {label}
        </button>
      ) : (
        <button type="button" onClick={openDialog} className={UPLOAD_BUTTON}>
          <Plus size={13} />
          {label}
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add document">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="documentFile" className={LABEL}>File<RequiredMark /></label>
            <input
              id="documentFile"
              type="file"
              onChange={(e) => chooseFile(e.target.files?.[0])}
              className={`${FIELD} file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-[12.5px] file:font-medium file:text-foreground`}
            />
            <p className="text-[11.5px] text-muted-foreground mt-1.5">PDF, image or any file up to 15MB.</p>
          </div>
          <div>
            <label htmlFor="documentName" className={LABEL}>Name<RequiredMark /></label>
            <input id="documentName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Project brief" className={FIELD} />
          </div>
          {clients && (
            <div>
              <span className={LABEL}>Client</span>
              <Select
                value={chosenClientId}
                onChange={(value) => {
                  setChosenClientId(value);
                  setJobId(NO_JOB);
                }}
                placeholder="Choose a client…"
                options={clients.map((c) => ({ value: c.id, label: c.name }))}
              />
            </div>
          )}
          {!projectId && jobChoices.length > 0 && (
            <div>
              <span className={LABEL}>Job (optional)</span>
              <Select
                value={jobId}
                onChange={setJobId}
                options={[{ value: NO_JOB, label: "Not on a job" }, ...jobChoices.map((j) => ({ value: j.id, label: j.name }))]}
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

/**
 * A table of documents: one client's (pass `clientId` and `jobs`), or every
 * client's at once (pass `clients`), in which case each row says which client
 * and job it is under. Clicking a row opens the preview, where the document
 * can be renamed, put on a job, shared or deleted.
 */
export function ClientDocuments({
  clientId, documents, jobs = [], clients, title = "Documents", titleHref, hint, toolbar, header = true,
}: {
  /** Off when the page header already has the title and the Add button, as on the Documents page. */
  header?: boolean;
  /** The one client this list is for. Leave out, and pass `clients`, for the all-clients list. */
  clientId?: string;
  documents: ClientDocument[];
  jobs?: JobOption[];
  clients?: DocumentClient[];
  title?: string;
  /** Makes the title a link, e.g. to the client's page. */
  titleHref?: string;
  hint?: string;
  /** "always" keeps the search and Filters showing however short the list is. */
  toolbar?: "always" | "auto";
}) {
  const [viewing, setViewing] = useState<ClientDocument | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(doc: ClientDocument) {
    if (!window.confirm(`Delete "${doc.name}"? The file is removed for good.`)) return;
    startTransition(() => deleteDocument(doc.id));
  }

  const clientOf = (doc: ClientDocument) => clients?.find((c) => c.id === doc.clientId) ?? null;
  const jobsFor = (doc: ClientDocument) => (clients ? (clientOf(doc)?.jobs ?? []) : jobs);
  const jobNameOf = (doc: ClientDocument) => jobsFor(doc).find((j) => j.id === doc.projectId)?.name ?? doc.projectName ?? null;

  const filters = [
    ...(clients
      ? [
          {
            key: "client",
            label: "Client",
            options: [
              ...clients.filter((c) => documents.some((d) => d.clientId === c.id)).map((c) => ({ value: c.id, label: c.name })),
              ...(documents.some((d) => !clientOf(d)) ? [{ value: NONE, label: "No client yet" }] : []),
            ],
          },
        ]
      : jobs.length > 0
        ? [{ key: "job", label: "Job", options: [{ value: NONE, label: "Not on a job" }, ...jobs.map((j) => ({ value: j.id, label: j.name }))] }]
        : []),
    { key: "sharing", label: "Sharing", options: SHARING_OPTIONS },
  ];

  return (
    // Not clipped, so the Filters menu can hang below a short list.
    <Card className={header ? "overflow-visible" : "overflow-visible p-5"}>
      {header && (
        <CardHeader
          title={titleHref ? <Link href={titleHref} className="hover:text-primary transition-colors">{title}</Link> : title}
          count={documents.length}
          description={hint}
          action={<AddDocumentButton label="Add document" clientId={clientId} jobs={jobs} clients={clients} />}
        />
      )}

      {documents.length === 0 ? (
        <p className={`text-[13px] text-muted-foreground ${header ? "px-5 pb-5" : ""}`}>No documents yet.</p>
      ) : (
        <DataTable
          inset={header}
          toolbar={toolbar}
          tableClassName="min-w-[640px]"
          searchPlaceholder={clients ? "Search by name, client or job…" : "Search documents…"}
          filters={filters}
          columns={[
            { label: "Name", className: "px-5" },
            { label: clients ? "Client" : "Job" },
            { label: "Sharing" },
            { label: "Added" },
            { label: "Actions", className: "px-5", align: "right" },
          ]}
          rows={documents.map((doc) => {
            const sharing = shareState(doc);
            const client = clientOf(doc);
            const jobName = jobNameOf(doc);
            return {
              id: doc.id,
              onClick: () => setViewing(doc),
              search: `${doc.name} ${client?.name ?? ""} ${jobName ?? ""}`,
              sort: [doc.name, clients ? (client?.name ?? null) : jobName, SHARING_OPTIONS.find((o) => o.value === sharing)?.label, doc.addedAt, undefined],
              filters: { client: client?.id ?? NONE, job: doc.projectId ?? NONE, sharing },
              cells: (
                <>
                  <td className="px-5 py-2.5">
                    <button
                      type="button"
                      onClick={() => setViewing(doc)}
                      title="Preview, edit and share"
                      className="flex items-center gap-2 max-w-[420px] text-left text-[13.5px] font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <FileIcon />
                      <span className="truncate">{doc.name}</span>
                    </button>
                  </td>
                  {clients ? (
                    <td className="px-4 py-2.5">
                      {client ? (
                        <Link
                          href={routes.clients.item(client.slug ?? client.id)}
                          className="text-[13px] font-medium text-foreground/90 hover:text-primary transition-colors"
                        >
                          {client.name}
                        </Link>
                      ) : (
                        <span className="text-[13px] text-muted-foreground">No client yet</span>
                      )}
                      {jobName && <span className="block text-[12px] text-muted-foreground">{jobName}</span>}
                    </td>
                  ) : (
                    <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{jobName ?? "—"}</td>
                  )}
                  <td className="px-4 py-2.5">
                    <ShareBadge doc={doc} />
                  </td>
                  <td className="px-4 py-2.5 text-[12.5px] text-muted-foreground whitespace-nowrap">{doc.added}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => remove(doc)}
                      disabled={isPending}
                      className="text-[12.5px] font-medium text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </>
              ),
            };
          })}
        />
      )}

      {viewing && (
        <DocumentDialog key={viewing.id} doc={viewing} jobs={jobsFor(viewing)} projectId={viewing.projectId} onClose={() => setViewing(null)} />
      )}
    </Card>
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
    <Card>
      <CardHeader
        title="Documents"
        count={documents.length}
        action={<AddDocumentButton label="Upload new" clientId={client?.id} projectId={projectId} />}
      />
      <div className="px-5 pb-5">

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
                className="flex items-center gap-2 min-w-0 flex-1 text-left text-[12.5px] text-foreground/80 hover:text-primary hover:underline underline-offset-2 transition-colors"
              >
                <FileIcon />
                <span className="truncate">{doc.name}</span>
              </button>
              <ShareBadge doc={doc} />
              <button
                type="button"
                onClick={() => setViewing(doc)}
                className="shrink-0 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                View
              </button>
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
      </div>
      {viewing && <DocumentDialog key={viewing.id} doc={viewing} onClose={() => setViewing(null)} />}
    </Card>
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
