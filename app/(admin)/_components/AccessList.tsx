"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Eye, EyeOff, ExternalLink, KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { Card, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { Select } from "@/app/(admin)/_components/Select";
import { RequiredMark } from "@/app/(admin)/_components/Section";
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
}

interface JobOption {
  id: string;
  name: string;
}

const ALL_JOBS = "";
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
 * Logins a client has handed over (WordPress admin, hosting, tools), with
 * their address, username and password. On a client's page, each one can be
 * put on one of their jobs; one with no job applies to all of them. On a job's
 * page, `projectId` is fixed and the client's all-jobs logins show too.
 */
export function AccessList({
  clientId, projectId, jobs = [], items,
}: {
  clientId: string | null;
  /** Fixed job, on a job's page. */
  projectId?: string;
  /** Jobs to choose from, on a client's page. */
  jobs?: JobOption[];
  items: AccessItem[];
}) {
  /** null = closed, "new" = adding, otherwise the login being edited. */
  const [editing, setEditing] = useState<AccessItem | "new" | null>(null);
  const [draft, setDraft] = useState<AccessFormData>(EMPTY);
  const [showTyped, setShowTyped] = useState(false);
  /** Passwords shown on screen, by id. */
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const jobName = (id: string | null) => jobs.find((j) => j.id === id)?.name ?? null;

  function open(target: AccessItem | "new") {
    setError(null);
    setShowTyped(false);
    setDraft(
      target === "new"
        ? { ...EMPTY, projectId: projectId ?? ALL_JOBS }
        : { label: target.label, url: target.url, username: target.username, password: "", clearPassword: false, notes: target.notes, projectId: target.projectId ?? ALL_JOBS },
    );
    setEditing(target);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.label.trim() || !editing) return;
    const target = editing;
    startTransition(async () => {
      const result = target === "new" ? await addAccess(clientId, draft) : await updateAccess(target.id, draft);
      if (!result.ok) {
        setError(result.error ?? "Couldn't save.");
        return;
      }
      if (target !== "new") setRevealed((r) => withoutKey(r, target.id));
      setEditing(null);
    });
  }

  function remove(item: AccessItem) {
    if (!window.confirm(`Remove the ${item.label} login? This can't be undone.`)) return;
    startTransition(() => deleteAccess(item.id));
  }

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

  const editingItem = editing !== null && editing !== "new" ? editing : null;

  return (
    <Card>
      <CardHeader
        title="Access"
        count={items.length}
        action={
          <button type="button" onClick={() => open("new")} className={`${cardActionClass} inline-flex items-center gap-1.5`}>
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
                  <button type="button" onClick={() => open(item)} className="text-left text-[13.5px] font-semibold text-foreground hover:text-primary transition-colors after:absolute after:inset-0">
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
                    {item.hasPassword && (
                      <p className="flex items-center gap-1">
                        <span className={`truncate text-foreground/80 ${revealed[item.id] !== undefined ? "font-mono" : "tracking-[0.2em]"}`}>
                          {revealed[item.id] ?? "••••••••"}
                        </span>
                        <button
                          type="button"
                          className={iconButton}
                          onClick={() => toggleReveal(item.id)}
                          aria-label={revealed[item.id] !== undefined ? "Hide password" : "Show password"}
                          title={revealed[item.id] !== undefined ? "Hide password" : "Show password"}
                        >
                          {revealed[item.id] !== undefined ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <CopyButton label="password" getText={() => fetchPassword(item.id)} />
                      </p>
                    )}
                    {item.notes && <p className="whitespace-pre-line text-muted-foreground">{item.notes}</p>}
                  </div>
                </div>
                <div className="relative z-10">
                  <RowMenu disabled={isPending}>
                    <RowMenuItem onClick={() => open(item)} icon={<Pencil size={14} />}>
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

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add login" : "Edit login"}>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accessLabel" className={labelClass}>Name<RequiredMark /></label>
              <input id="accessLabel" required autoFocus value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="e.g. WordPress admin" className={fieldClass} {...noAutofill} />
            </div>
            {!projectId && jobs.length > 0 && (
              <div>
                <label className={labelClass}>Job</label>
                <Select
                  value={draft.projectId}
                  onChange={(value) => setDraft({ ...draft, projectId: value })}
                  className={`${fieldClass} flex items-center justify-between gap-2`}
                  options={[{ value: ALL_JOBS, label: "All jobs" }, ...jobs.map((j) => ({ value: j.id, label: j.name }))]}
                />
              </div>
            )}
          </div>
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
                  placeholder={editingItem?.hasPassword ? "Leave empty to keep" : ""}
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
              {editingItem?.hasPassword && !draft.password && (
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
          <DialogActions onCancel={() => setEditing(null)} pending={isPending} submitLabel={editing === "new" ? "Add login" : "Save"} />
        </form>
      </Modal>
    </Card>
  );
}
