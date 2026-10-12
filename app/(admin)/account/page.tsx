import { requireSession } from "@/app/lib/session";
import { prisma } from "@/app/lib/prisma";
import { PageHeader } from "@/app/(admin)/_components/PageHeader";
import { AccountOverview } from "./AccountOverview";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { InvoiceDetailsForm } from "./InvoiceDetailsForm";

export default async function AccountPage() {
  const session = await requireSession();
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: {
      invoiceAddress: true,
      invoiceBankDetails: true,
      invoicePaymentTerms: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle={`Signed in as ${session.user.email}.`}
      />

      <div className="max-w-3xl">
        <AccountOverview email={session.user.email} />
        <InvoiceDetailsForm
          initial={{
            address: settings?.invoiceAddress ?? "",
            bankDetails: settings?.invoiceBankDetails ?? "",
            paymentTerms: settings?.invoicePaymentTerms ?? "",
          }}
        />
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-[14px] font-semibold text-foreground">
            Password
          </h2>
          <p className="text-[12.5px] text-muted-foreground mt-0.5 mb-4">
            Used to sign in to this admin.
          </p>
          <ChangePasswordForm />
        </section>
      </div>
    </div>
  );
}
