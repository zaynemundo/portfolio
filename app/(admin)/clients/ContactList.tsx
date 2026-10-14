"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { RowMenu, RowMenuItem } from "@/app/(admin)/_components/ui/RowMenu";
import { addContact, updateContact, deleteContact } from "@/app/actions/contacts";
import { Modal } from "@/app/(admin)/_components/Modal";
import { DialogActions } from "@/app/(admin)/_components/DialogActions";
import { Card, CardHeader } from "@/app/(admin)/_components/ui/Card";
import { DataTable } from "@/app/(admin)/_components/ui/DataTable";

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
        description={<>The first contact&rsquo;s email is used when you send an invoice or quote.</>}
        action={
          <button
            type="button"
            onClick={() => open("new")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border text-foreground/80 text-[12.5px] font-medium px-3 py-1.5 hover:bg-card transition-colors shrink-0"
          >
            <Plus size={13} />
            Add contact
          </button>
        }
      />

      {contacts.length === 0 ? (
        <p className="px-5 pb-5 text-[13px] text-muted-foreground">No contacts yet.</p>
      ) : (
        <DataTable
          tableClassName="min-w-[560px]"
          searchPlaceholder="Search contacts…"
          columns={[{ label: "Name", className: "px-5" }, { label: "Email", className: "px-3" }, { label: "Phone", className: "px-3" }, { className: "w-12" }]}
          rows={contacts.map((contact) => ({
            id: contact.id,
            onClick: () => open(contact),
            search: `${contact.name} ${contact.role} ${contact.email} ${contact.phone}`,
            sort: [contact.name, contact.email || null, contact.phone || null, undefined],
            cells: (
              <>
                  <td className="px-5 py-2.5">
                    <span className="text-[13.5px] font-medium text-foreground">{contact.name}</span>
                    {contact.role && <span className="block text-[12px] text-muted-foreground">{contact.role}</span>}
                  </td>
                  <td className="px-3 py-2.5 text-[13px]">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="text-foreground/80 hover:text-primary transition-colors">{contact.email}</a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[13px]">
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="text-foreground/80 hover:text-primary transition-colors">{contact.phone}</a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-right whitespace-nowrap">
                    <RowMenu disabled={isPending}>
                      <RowMenuItem onClick={() => open(contact)} icon={<Pencil size={14} />}>
                        Edit
                      </RowMenuItem>
                      <RowMenuItem onClick={() => remove(contact)} danger icon={<Trash2 size={14} />}>
                        Remove
                      </RowMenuItem>
                    </RowMenu>
                  </td>
              </>
            ),
          }))}
        />
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add contact" : "Edit contact"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className={labelClass}>Name</label>
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
