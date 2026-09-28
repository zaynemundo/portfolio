import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { routes } from "@/app/(admin)/_routes";

const getContacts = unstable_cache(
  () =>
    prisma.contact.findMany({
      orderBy: [{ client: { name: "asc" } }, { sortOrder: "asc" }],
      include: { client: { select: { id: true, name: true } } },
    }),
  ["contacts-list"],
  { tags: [CACHE_TAGS.contacts, CACHE_TAGS.clients], revalidate: 60 }
);

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} contact${contacts.length === 1 ? "" : "s"} across all clients`}
      />

      {contacts.length === 0 ? (
        <EmptyState message="No contacts yet — add one from a client's page." />
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Name</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Role</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Client</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Email</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-zinc-800/70 last:border-b-0 hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-[13.5px] font-medium text-zinc-100">{contact.name}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{contact.role ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={routes.clients.item(contact.client.id)} className="text-[13px] text-purple-400 hover:text-purple-300 transition-colors">
                      {contact.client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{contact.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-zinc-400">{contact.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
