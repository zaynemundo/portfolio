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

      <div className="space-y-2 mb-3">
        {contacts.map((contact) => (
          <ContactRow key={contact.id} clientId={clientId} contact={contact} />
        ))}
        {contacts.length === 0 && <p className="text-[12.5px] text-muted-foreground/70">No contacts yet.</p>}
      </div>

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

  return (
    <div className="rounded-lg border border-border bg-card/40 px-3 py-2.5 group">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          style={{ outline: "none" }}
          className="text-[13px] font-medium text-foreground/90 bg-transparent flex-1"
        />
        <button
          type="button"
          onClick={() => startTransition(() => deleteContact(contact.id, clientId))}
          disabled={isPending}
          className="text-muted-foreground/70 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 text-[13px] disabled:opacity-30"
          aria-label="Delete contact"
        >
          ×
        </button>
      </div>
      <input
        value={role}
        onChange={(e) => setRole(e.target.value)}
        onBlur={save}
        placeholder="Role (optional)"
        style={{ outline: "none" }}
        className="w-full text-[12px] text-muted-foreground placeholder:text-muted-foreground bg-transparent mb-1"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={save}
          placeholder="Email (optional)"
          style={{ outline: "none" }}
          className="rounded-md bg-secondary/60 px-2 py-1 text-[11.5px] text-foreground/70 placeholder:text-muted-foreground"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={save}
          placeholder="Phone (optional)"
          style={{ outline: "none" }}
          className="rounded-md bg-secondary/60 px-2 py-1 text-[11.5px] text-foreground/70 placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
