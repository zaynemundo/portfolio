import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { CACHE_TAGS } from "@/app/lib/cache-tags";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { EmptyState } from "@/app/(admin)/_components/EmptyState";
import { routes } from "@/app/(admin)/_routes";
import { PageTable } from "@/app/(admin)/_components/ui/DataTable";

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
  const clientOptions = [...new Map(contacts.map((c) => [c.client.id, c.client.name])).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} contact${contacts.length === 1 ? "" : "s"} across all clients`}
      />

      {contacts.length === 0 ? (
        <EmptyState message="No contacts yet — add one from a client's page." />
      ) : (
        <PageTable
          searchPlaceholder="Search by name, client, email or phone…"
          filters={[{ key: "client", label: "Client", options: clientOptions }]}
          columns={[{ label: "Name" }, { label: "Role" }, { label: "Client" }, { label: "Email" }, { label: "Phone" }]}
          rows={contacts.map((contact) => ({
            id: contact.id,
            href: routes.clients.item(contact.client.slug ?? contact.client.id),
            search: `${contact.name} ${contact.role ?? ""} ${contact.client.name} ${contact.email ?? ""} ${contact.phone ?? ""}`,
            sort: [contact.name, contact.role, contact.client.name, contact.email, contact.phone],
            filters: { client: contact.client.id },
            cells: (
              <>
                <td className="px-4 py-3 text-[13.5px] font-medium text-foreground">{contact.name}</td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{contact.role ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link href={routes.clients.item(contact.client.slug ?? contact.client.id)} className="text-[13px] text-primary hover:text-primary transition-colors">
                    {contact.client.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{contact.email ?? "—"}</td>
                <td className="px-4 py-3 text-[13px] text-muted-foreground">{contact.phone ?? "—"}</td>
              </>
            ),
          }))}
        />
      )}
    </div>
  );
}
