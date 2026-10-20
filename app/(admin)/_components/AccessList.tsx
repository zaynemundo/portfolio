"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Copy, Eye, EyeOff, ExternalLink, KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { Card, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { Select } from "@/app/(admin)/_components/Select";
import { RequiredMark } from "@/app/(admin)/_components/Section";
import { pageActionClass } from "@/app/(admin)/_components/PageHeader";
import { routes } from "@/app/(admin)/_routes";
import { addAccess, deleteAccess, revealAccessPassword, updateAccess, type AccessFormData } from "@/app/actions/access";

/** One saved login. The password itself never comes with the page: only whether one is saved. */
export interface AccessItem {
  id: string;
  label: string;
  url: string;
  username: string;
  hasPassword: boolean;
  notes: string;
  /** The job it's for; null = all of the client's jobs. */
  projectId: string | null;
  /** Which client it is filed under. Only needed for the all-clients table. */
  clientId?: string | null;
  /** The job's name, for a login whose job can't be looked up from its client (it has no client yet). */
  projectName?: string | null;
}

interface JobOption {
  id: string;
  name: string;
}

/** A client as the all-clients table needs it: its name, its page, and the jobs its logins can go on. */
export interface AccessClient {
  id: string;
  slug: string | null;
  name: string;
  jobs: JobOption[];
}

const ALL_JOBS = "";
/** Filter value for logins with no job, or no client (a filter value can't be empty). */
const NONE = "none";
const EMPTY: AccessFormData = { label: "", url: "", username: "", password: "", notes: "", projectId: ALL_JOBS };
const fieldClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";
const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";
const iconButton =
  "relative z-10 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors";
/** Keeps password managers from offering to fill or save these: they're the client's logins, not yours. */
const noAutofill = { autoComplete: "off", "data-lpignore": "true", "data-1p-ignore": "" } as const;

/** "https://site.com/wp-admin" → "site.com/wp-admin", for a shorter line. */
function shortUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** A copy of `record` without `key`. */
function withoutKey(record: Record<string, string>, key: string): Record<string, string> {
  const next = { ...record };
  delete next[key];
  return next;
}

function href(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

/** A small copy button that briefly turns into a tick. */
function CopyButton({ label, getText }: { label: string; getText: () => Promise<string | null> }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={iconButton}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      onClick={async () => {
        const text = await getText();
        if (text == null) return;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  );
}

/**
 * Show/Copy for saved passwords. A password is fetched only when Show or Copy
 * is clicked, and is kept on screen (by id) until hidden again.
 */
function usePasswords() {
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  async function fetchPassword(id: string): Promise<string | null> {
    if (revealed[id] !== undefined) return revealed[id];
    const result = await revealAccessPassword(id);
    if (!result.ok || result.password === undefined) {
      window.alert(result.error ?? "Couldn't read the password.");
      return null;
    }
    return result.password;
  }

  async function toggleReveal(id: string) {
    if (revealed[id] !== undefined) {
      setRevealed((r) => withoutKey(r, id));
      return;
    }
    const password = await fetchPassword(id);
    if (password !== null) setRevealed((r) => ({ ...r, [id]: password }));
  }

  /** After an edit, so a changed password isn't still showing the old one. */
  const forget = (id: string) => setRevealed((r) => withoutKey(r, id));

  return { revealed, fetchPassword, toggleReveal, forget };
}

/** Dots (or the password, once shown), with Show/Hide and Copy. */
function PasswordField({ id, passwords }: { id: string; passwords: ReturnType<typeof usePasswords> }) {
  const shown = passwords.revealed[id];
  return (
    <span className="flex items-center gap-1">
      <span className={`truncate text-foreground/80 ${shown !== undefined ? "font-mono" : "tracking-[0.2em]"}`}>{shown ?? "••••••••"}</span>
      <button
        type="button"
        className={iconButton}
        onClick={() => passwords.toggleReveal(id)}
        aria-label={shown !== undefined ? "Hide password" : "Show password"}
        title={shown !== undefined ? "Hide password" : "Show password"}
      >
        {shown !== undefined ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      <CopyButton label="password" getText={() => passwords.fetchPassword(id)} />
    </span>
  );
}

/**
 * The add/edit form, in a dialog. Adding from the all-clients table asks for
 * the client first (`clients`); from a client's page their jobs can be chosen
 * (`jobs`); from a job's page the job is fixed (`projectId`).
 */
function AccessDialog({
  target, clientId, projectId, jobs = [], clients, onClose, onSaved,
}: {
  /** "new" = adding, otherwise the login being edited. */
  target: AccessItem | "new";
  clientId?: string | null;
  projectId?: string;
  jobs?: JobOption[];
  clients?: AccessClient[];
  onClose: () => void;
  onSaved?: (id: string | null) => void;
}) {
  const editing = target === "new" ? null : target;
  const [draft, setDraft] = useState<AccessFormData>(
    editing
      ? { label: editing.label, url: editing.url, username: editing.username, password: "", clearPassword: false, notes: editing.notes, projectId: editing.projectId ?? ALL_JOBS }
      : { ...EMPTY, projectId: projectId ?? ALL_JOBS },
  );
  const [chosenClientId, setChosenClientId] = useState(clients?.length === 1 ? clients[0].id : "");
  const [showTyped, setShowTyped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Which client's jobs can be picked: the one chosen (adding here), the row's own (editing here), or the page's.
  const jobChoices = clients
    ? (clients.find((c) => c.id === (editing ? editing.clientId : chosenClientId))?.jobs ?? [])
    : jobs;
  const askClient = Boolean(clients && !editing);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.label.trim()) return;
    if (askClient && !chosenClientId) {
      setError("Choose the client this login is for.");
      return;
    }
    startTransition(async () => {
      const result = editing
        ? await updateAccess(editing.id, draft)
        : await addAccess(askClient ? chosenClientId : (clientId ?? null), draft);
      if (!result.ok) {
        setError(result.error ?? "Couldn't save.");
        return;
      }
      onSaved?.(editing?.id ?? null);
      onClose();
    });
  }

  return (
    <Modal open onClose={onClose} title={editing ? "Edit login" : "Add login"}>
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div>
          <label htmlFor="accessLabel" className={labelClass}>Name<RequiredMark /></label>
          <input id="accessLabel" required autoFocus value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="e.g. WordPress admin" className={fieldClass} {...noAutofill} />
        </div>
        {(askClient || (!projectId && jobChoices.length > 0)) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {askClient && (
              <div>
                <span className={labelClass}>Client<RequiredMark /></span>
                <Select
                  value={chosenClientId}
                  onChange={(value) => {
                    setChosenClientId(value);
                    setDraft({ ...draft, projectId: ALL_JOBS });
                  }}
                  placeholder="Choose a client…"
                  className={`${fieldClass} flex items-center justify-between gap-2`}
                  options={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>
            )}
            {!projectId && jobChoices.length > 0 && (
              <div>
                <span className={labelClass}>Job</span>
                <Select
                  value={draft.projectId}
                  onChange={(value) => setDraft({ ...draft, projectId: value })}
                  className={`${fieldClass} flex items-center justify-between gap-2`}
                  options={[{ value: ALL_JOBS, label: "All jobs" }, ...jobChoices.map((j) => ({ value: j.id, label: j.name }))]}
                />
              </div>
            )}
          </div>
        )}
        <div>
          <label htmlFor="accessUrl" className={labelClass}>Login address</label>
          <input id="accessUrl" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="e.g. clientsite.com/wp-admin" className={fieldClass} {...noAutofill} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="accessUsername" className={labelClass}>Username or email</label>
            <input id="accessUsername" value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} className={fieldClass} {...noAutofill} />
          </div>
          <div>
            <label htmlFor="accessPassword" className={labelClass}>Password</label>
            <div className="relative">
              <input
                id="accessPassword"
                type={showTyped ? "text" : "password"}
                value={draft.password}
                onChange={(e) => setDraft({ ...draft, password: e.target.value, clearPassword: false })}
                placeholder={editing?.hasPassword ? "Leave empty to keep" : ""}
                className={`${fieldClass} pr-9`}
                {...noAutofill}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowTyped((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showTyped ? "Hide typed password" : "Show typed password"}
              >
                {showTyped ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {editing?.hasPassword && !draft.password && (
              <label className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <input type="checkbox" checked={draft.clearPassword ?? false} onChange={(e) => setDraft({ ...draft, clearPassword: e.target.checked })} />
                Remove the saved password
              </label>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="accessNotes" className={labelClass}>Notes</label>
          <textarea id="accessNotes" rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="e.g. 2FA code goes to the client's phone" className={`${fieldClass} resize-none`} {...noAutofill} />
        </div>
        <p className="text-[12px] text-muted-foreground">The password is encrypted before it&apos;s saved.</p>
        {error && <p className="text-[13px] text-destructive" role="alert">{error}</p>}
        <DialogActions onCancel={onClose} pending={isPending} submitLabel={editing ? "Save" : "Add login"} />
      </form>
    </Modal>
  );
}

/** The Access page's "+ Add login" button, which asks for the client. */
export function AddAccessButton({ clients }: { clients: AccessClient[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={pageActionClass}>
        + Add login
      </button>
      {open && <AccessDialog target="new" clients={clients} onClose={() => setOpen(false)} />}
    </>
  );
}

/**
 * Every client's logins in one table: name, username, password (with Show and
 * Copy), login address, and the client (with the job underneath). Clicking a
 * row edits it.
 */
export function AccessTable({ items, clients }: { items: AccessItem[]; clients: AccessClient[] }) {
  const [editing, setEditing] = useState<AccessItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const passwords = usePasswords();

  const clientOf = (item: AccessItem) => clients.find((c) => c.id === item.clientId) ?? null;
  const jobNameOf = (item: AccessItem) =>
    item.projectId ? (clientOf(item)?.jobs.find((j) => j.id === item.projectId)?.name ?? item.projectName ?? null) : null;

  function remove(item: AccessItem) {
    if (!window.confirm(`Remove the ${item.label} login? This can't be undone.`)) return;
    startTransition(() => deleteAccess(item.id));
  }

  const filters = [
    {
      key: "client",
      label: "Client",
      options: [
        ...clients.filter((c) => items.some((i) => i.clientId === c.id)).map((c) => ({ value: c.id, label: c.name })),
        ...(items.some((i) => !clientOf(i)) ? [{ value: NONE, label: "No client yet" }] : []),
      ],
    },
  ];

  return (
    // Not clipped, so the Filters menu can hang below a short list.
    <Card className="overflow-visible p-5">
      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No logins yet. Add the WordPress admin, hosting or tool logins a client gives you.</p>
      ) : (
        <DataTable
          inset={false}
          toolbar="always"
          tableClassName="min-w-[860px]"
          searchPlaceholder="Search by name, username, address or client…"
          filters={filters}
          columns={[
            { label: "Name", className: "px-5" },
            { label: "Username or email" },
            { label: "Password" },
            { label: "Login address" },
            { label: "Client" },
            { label: <span className="sr-only">Actions</span>, className: "px-5", align: "right" },
          ]}
          rows={items.map((item) => {
            const client = clientOf(item);
            const jobName = jobNameOf(item);
            return {
              id: item.id,
              onClick: () => setEditing(item),
              search: `${item.label} ${item.username} ${item.url} ${item.notes} ${client?.name ?? ""} ${jobName ?? ""}`,
              sort: [item.label, item.username || null, undefined, item.url ? shortUrl(item.url) : null, client?.name ?? null, undefined],
              filters: { client: client?.id ?? NONE },
              cells: (
                <>
                  <td className="px-5 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground" aria-hidden>
                        <KeyRound size={13} />
                      </span>
                      <span className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="block max-w-[220px] truncate text-left text-[13.5px] font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {item.label}
                        </button>
                        {item.notes && <span className="block max-w-[220px] truncate text-[12px] text-muted-foreground" title={item.notes}>{item.notes}</span>}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px]">
                    {item.username ? (
                      <span className="flex items-center gap-1">
                        <span className="max-w-[200px] truncate text-foreground/80">{item.username}</span>
                        <CopyButton label="username" getText={async () => item.username} />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[13px]">
                    {item.hasPassword ? <PasswordField id={item.id} passwords={passwords} /> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-[13px]">
                    {item.url ? (
                      <a href={href(item.url)} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[220px] items-center gap-1 text-foreground/80 hover:text-primary transition-colors">
                        <span className="truncate">{shortUrl(item.url)}</span>
                        <ExternalLink size={11} className="shrink-0" aria-hidden />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {client ? (
                      <Link href={routes.clients.item(client.slug ?? client.id)} className="text-[13px] font-medium text-foreground/90 hover:text-primary transition-colors">
                        {client.name}
                      </Link>
                    ) : (
                      <span className="text-[13px] text-muted-foreground">No client yet</span>
                    )}
                    <span className="block text-[12px] text-muted-foreground">{jobName ?? (client ? "All jobs" : "")}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <RowMenu disabled={isPending}>
                      <RowMenuItem onClick={() => setEditing(item)} icon={<Pencil size={14} />}>
                        Edit
                      </RowMenuItem>
                      <RowMenuItem onClick={() => remove(item)} danger icon={<Trash2 size={14} />}>
                        Remove
                      </RowMenuItem>
                    </RowMenu>
                  </td>
                </>
              ),
            };
          })}
        />
      )}

      {editing && (
        <AccessDialog
          key={editing.id}
          target={editing}
          clients={clients}
          projectId={editing.clientId ? undefined : (editing.projectId ?? undefined)}
          onClose={() => setEditing(null)}
          onSaved={(id) => id && passwords.forget(id)}
        />
      )}
    </Card>
  );
}

/**
 * Logins a client has handed over (WordPress admin, hosting, tools), with
 * their address, username and password, as a compact list for the side
 * column of a client's or job's page. On a client's page, each one can be
 * put on one of their jobs; one with no job applies to all of them. On a job's
 * page, `projectId` is fixed and the client's all-jobs logins show too.
 */
export function AccessList({
  clientId, projectId, jobs = [], items, title = "Access",
}: {
  clientId: string | null;
  /** The card's title. */
  title?: React.ReactNode;
  /** Fixed job, on a job's page. */
  projectId?: string;
  /** Jobs to choose from, on a client's page. */
  jobs?: JobOption[];
  items: AccessItem[];
}) {
  /** null = closed, "new" = adding, otherwise the login being edited. */
  const [editing, setEditing] = useState<AccessItem | "new" | null>(null);
  const [isPending, startTransition] = useTransition();
  const passwords = usePasswords();
  const jobName = (id: string | null) => jobs.find((j) => j.id === id)?.name ?? null;

  function remove(item: AccessItem) {
    if (!window.confirm(`Remove the ${item.label} login? This can't be undone.`)) return;
    startTransition(() => deleteAccess(item.id));
  }

  return (
    <Card>
      <CardHeader
        title={title}
        count={items.length}
        action={
          <button type="button" onClick={() => setEditing("new")} className={`${cardActionClass} inline-flex items-center gap-1.5`}>
            <Plus size={13} />
            Add
          </button>
        }
      />

      {items.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-muted-foreground">No logins yet. Add the WordPress admin, hosting or tool logins the client gives you.</p>
      ) : (
        <ul className="border-t border-border">
          {items.map((item) => {
            const scope = projectId
              ? item.projectId === null ? "All jobs" : null
              : item.projectId ? jobName(item.projectId) : null;
            return (
              <li key={item.id} className="group relative flex items-start gap-3 border-b border-border/70 px-5 py-3 last:border-b-0 hover:bg-primary/[0.04] transition-colors">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground" aria-hidden>
                  <KeyRound size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => setEditing(item)} className="text-left text-[13.5px] font-semibold text-foreground hover:text-primary transition-colors after:absolute after:inset-0">
                    {item.label}
                  </button>
                  {scope && <p className="text-[12px] text-muted-foreground">{scope}</p>}
                  <div className="relative z-10 mt-1 space-y-0.5 text-[12.5px]">
                    {item.url && (
                      <a href={href(item.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 truncate text-foreground/80 hover:text-primary transition-colors">
                        <span className="truncate">{shortUrl(item.url)}</span>
                        <ExternalLink size={11} className="shrink-0" aria-hidden />
                      </a>
                    )}
                    {item.username && (
                      <p className="flex items-center gap-1">
                        <span className="truncate text-foreground/80">{item.username}</span>
                        <CopyButton label="username" getText={async () => item.username} />
                      </p>
                    )}
                    {item.hasPassword && <PasswordField id={item.id} passwords={passwords} />}
                    {item.notes && <p className="whitespace-pre-line text-muted-foreground">{item.notes}</p>}
                  </div>
                </div>
                <div className="relative z-10">
                  <RowMenu disabled={isPending}>
                    <RowMenuItem onClick={() => setEditing(item)} icon={<Pencil size={14} />}>
                      Edit
                    </RowMenuItem>
                    <RowMenuItem onClick={() => remove(item)} danger icon={<Trash2 size={14} />}>
                      Remove
                    </RowMenuItem>
                  </RowMenu>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing !== null && (
        <AccessDialog
          key={editing === "new" ? "new" : editing.id}
          target={editing}
          clientId={clientId}
          projectId={projectId}
          jobs={jobs}
          onClose={() => setEditing(null)}
          onSaved={(id) => id && passwords.forget(id)}
        />
      )}
    </Card>
  );
}
