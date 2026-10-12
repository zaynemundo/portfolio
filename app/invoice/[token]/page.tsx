import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getSharedInvoiceDocument } from "@/app/lib/invoice-document";
import { InvoiceSheet } from "@/app/components/InvoiceSheet";

interface Props {
  params: Promise<{ token: string }>;
}

// Private link: never cached, never indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Invoice or quote",
  robots: { index: false, follow: false },
};

/** The page a client opens from a shared invoice link. */
export default async function SharedInvoicePage({ params }: Props) {
  const { token } = await params;
  const invoice = await getSharedInvoiceDocument(token);

  if (!invoice) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-5">
        <div className="max-w-sm text-center">
          <h1 className="text-[20px] font-bold text-zinc-900 mb-2">This link is no longer available</h1>
          <p className="text-[14px] text-zinc-500">It may have been withdrawn. Please ask the sender for a new link.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:py-12 print:bg-white print:p-0">
      <div className="max-w-[820px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-5 print:hidden">
          <p className="text-[13px] text-zinc-500">
            {invoice.isQuote ? "Quote" : "Invoice"} <span className="font-semibold text-zinc-900">{invoice.number}</span> from {invoice.sender.name}
          </p>
          <a
            href={`/invoice/${token}/pdf`}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 text-white text-[13.5px] font-semibold px-4 py-2 hover:bg-zinc-700 transition-colors"
          >
            <Download size={15} />
            Download PDF
          </a>
        </div>
        <InvoiceSheet invoice={invoice} />
      </div>
    </main>
  );
}
