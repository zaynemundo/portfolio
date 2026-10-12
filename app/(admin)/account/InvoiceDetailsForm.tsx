"use client";

import { useState, useTransition } from "react";
import { updateInvoiceDetails } from "@/app/actions/settings";

interface Props {
  initial: { address: string; bankDetails: string; paymentTerms: string };
}

const inputClass =
  "w-full rounded-lg bg-background border border-border px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors resize-y";
const labelClass = "block text-[12px] font-medium text-foreground/80 mb-1.5";

/** Sender details printed on every invoice and its PDF. */
export function InvoiceDetailsForm({ initial }: Props) {
  const [address, setAddress] = useState(initial.address);
  const [bankDetails, setBankDetails] = useState(initial.bankDetails);
  const [paymentTerms, setPaymentTerms] = useState(initial.paymentTerms);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateInvoiceDetails({ address, bankDetails, paymentTerms });
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 mb-8 space-y-4">
      <div>
        <h2 className="text-[14px] font-semibold text-foreground">Invoice details</h2>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">
          Printed on every invoice, along with your name, email and phone from the About page.
        </p>
      </div>

      <div>
        <label htmlFor="invoiceAddress" className={labelClass}>Your address</label>
        <textarea
          id="invoiceAddress"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={"Building, street\nCity, country"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="invoiceBankDetails" className={labelClass}>Bank details</label>
        <textarea
          id="invoiceBankDetails"
          rows={4}
          value={bankDetails}
          onChange={(e) => setBankDetails(e.target.value)}
          placeholder={"Account name\nBank name\nIBAN\nSWIFT / BIC"}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="invoicePaymentTerms" className={labelClass}>Payment terms</label>
        <textarea
          id="invoicePaymentTerms"
          rows={2}
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          placeholder="Payment due within 14 days of the invoice date."
          className={inputClass}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-[12.5px] text-success">Saved</span>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save invoice details"}
        </button>
      </div>
    </form>
  );
}
