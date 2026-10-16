"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { addContact, updateContact, deleteContact } from "@/app/actions/contacts";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { Card, CardHeader, cardActionClass } from "@/app/(admin)/_components/ui/Card";
import { RequiredMark } from "@/app/(admin)/_components/Section";

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

type Draft = Omit<Contact, "id">;

const EMPTY: Draft = { name: "", role: "", email: "", phone: "" };
const fieldClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground focus:outline-none focus:border-ring transition-colors";
const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";

/**
 * A client's contacts as a plain list. Adding and editing happen in a dialog
 * with all four fields at once, so the page stays readable and it's never
 * unclear where an email or phone number goes.
 */
export function ContactList({ clientId, contacts }: { clientId: string; contacts: Contact[] }) {
  /** null = closed, "new" = adding, otherwise the contact being edited. */
  const [editing, setEditing] = useState<Contact | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [isPending, startTransition] = useTransition();

  function open(target: Contact | "new") {
    setDraft(target === "new" ? EMPTY : { name: target.name, role: target.role, email: target.email, phone: target.phone });
    setEditing(target);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !editing) return;
    const target = editing;
    startTransition(async () => {
      if (target === "new") await addContact(clientId, draft);
      else await updateContact(target.id, clientId, draft);
      setEditing(null);
    });
  }

  function remove(contact: Contact) {
    if (!window.confirm(`Remove ${contact.name} from this client?`)) return;
    startTransition(() => deleteContact(contact.id));
  }

  return (
    <Card>
      <CardHeader
        title="Contacts"
        count={contacts.length}
        action={
          <button type="button" onClick={() => open("new")} className={`${cardActionClass} inline-flex items-center gap-1.5`}>
            <Plus size={13} />
            Add
          </button>
        }
      />

      {contacts.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-muted-foreground">No contacts yet. Invoices and quotes are emailed to the first one you add.</p>
      ) : (
        <ul className="border-t border-border">
          {contacts.map((contact, i) => (
            <li key={contact.id} className="group relative flex items-start gap-3 border-b border-border/70 px-5 py-3 last:border-b-0 hover:bg-primary/[0.04] transition-colors">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground" aria-hidden>
                {contact.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => open(contact)} className="text-left text-[13.5px] font-semibold text-foreground hover:text-primary transition-colors after:absolute after:inset-0">
                  {contact.name}
                </button>
                {(contact.role || i === 0) && (
                  <p className="text-[12px] text-muted-foreground">
                    {contact.role}
                    {contact.role && i === 0 && " · "}
                    {i === 0 && "Gets invoices"}
                  </p>
                )}
                <p className="relative z-10 mt-0.5 flex flex-col text-[12.5px]">
                  {contact.email && <a href={`mailto:${contact.email}`} className="truncate text-foreground/80 hover:text-primary transition-colors">{contact.email}</a>}
                  {contact.phone && <a href={`tel:${contact.phone}`} className="text-foreground/80 hover:text-primary transition-colors">{contact.phone}</a>}
                </p>
              </div>
              <div className="relative z-10">
                <RowMenu disabled={isPending}>
                  <RowMenuItem onClick={() => open(contact)} icon={<Pencil size={14} />}>
                    Edit
                  </RowMenuItem>
                  <RowMenuItem onClick={() => remove(contact)} danger icon={<Trash2 size={14} />}>
                    Remove
                  </RowMenuItem>
                </RowMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add contact" : "Edit contact"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className={labelClass}>Name<RequiredMark /></label>
              <input id="contactName" required autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="contactRole" className={labelClass}>Role (optional)</label>
              <input id="contactRole" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="e.g. Marketing manager" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="contactEmail" className={labelClass}>Email</label>
              <input id="contactEmail" type="email" autoComplete="off" data-lpignore="true" data-1p-ignore="" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="contactPhone" className={labelClass}>Phone</label>
              <input id="contactPhone" type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={fieldClass} />
            </div>
          </div>
          <DialogActions onCancel={() => setEditing(null)} pending={isPending} submitLabel={editing === "new" ? "Add contact" : "Save"} />
        </form>
      </Modal>
    </Card>
  );
}
