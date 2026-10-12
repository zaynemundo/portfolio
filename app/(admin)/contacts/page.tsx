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
      include: { client: { select: { id: true, slug: true, name: true } } },
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
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-border/70 last:border-b-0 hover:bg-card/40">
                  <td className="px-4 py-3 text-[13.5px] font-medium text-foreground">{contact.name}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{contact.role ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={routes.clients.item(contact.client.slug ?? contact.client.id)} className="text-[13px] text-primary hover:text-primary transition-colors">
                      {contact.client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{contact.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{contact.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
