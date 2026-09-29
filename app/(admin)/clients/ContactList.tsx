"use client";

import { useState, useTransition } from "react";
import { addContact, updateContact, deleteContact } from "@/app/actions/contacts";

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export function ContactList({ clientId, contacts }: { clientId: string; contacts: Contact[] }) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const n = name;
    setName("");
    startTransition(() => addContact(clientId, { name: n, role: "", email: "", phone: "" }));
  }

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <h2 className="text-[13px] font-semibold text-foreground mb-3">Contacts</h2>

      {contacts.length > 0 ? (
        <table className="w-full text-left mb-3">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 pr-2 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">Name</th>
              <th className="pb-2 pr-2 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="pb-2 pr-2 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="pb-2 pr-2 text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">Phone</th>
              <th className="pb-2 w-6" />
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <ContactRow key={contact.id} clientId={clientId} contact={contact} />
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-[12.5px] text-muted-foreground/70 mb-3">No contacts yet.</p>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a contact…"
          style={{ outline: "none" }}
          className="flex-1 rounded-lg bg-card border border-border px-2.5 py-1.5 text-[12.5px] text-foreground placeholder:text-muted-foreground/70 focus:border-ring transition-colors"
        />
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded-lg border border-border text-foreground/70 text-[12px] font-medium px-2.5 hover:bg-secondary transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}

function ContactRow({ clientId, contact }: { clientId: string; contact: Contact }) {
  const [name, setName] = useState(contact.name);
  const [role, setRole] = useState(contact.role);
  const [email, setEmail] = useState(contact.email);
  const [phone, setPhone] = useState(contact.phone);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(() => updateContact(contact.id, clientId, { name, role, email, phone }));
  }

  const cellInputClass = "w-full bg-transparent text-[12.5px] text-foreground/90 placeholder:text-muted-foreground/70";

  return (
    <tr className="group border-b border-border/70 last:border-b-0 hover:bg-card/40">
      <td className="py-2 pr-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={save} style={{ outline: "none" }} className={`${cellInputClass} font-medium`} />
      </td>
      <td className="py-2 pr-2">
        <input value={role} onChange={(e) => setRole(e.target.value)} onBlur={save} placeholder="—" style={{ outline: "none" }} className={cellInputClass} />
      </td>
      <td className="py-2 pr-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={save} placeholder="—" style={{ outline: "none" }} className={cellInputClass} />
      </td>
      <td className="py-2 pr-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} onBlur={save} placeholder="—" style={{ outline: "none" }} className={cellInputClass} />
      </td>
      <td className="py-2">
        <button
          type="button"
          onClick={() => startTransition(() => deleteContact(contact.id, clientId))}
          disabled={isPending}
          className="text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 text-[13px] disabled:opacity-30"
          aria-label="Delete contact"
        >
          ×
        </button>
      </td>
    </tr>
  );
}
