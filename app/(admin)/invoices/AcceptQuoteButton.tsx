"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptQuote } from "@/app/actions/invoices";
import { routes } from "@/app/(admin)/_routes";

/** The client said yes — makes a draft invoice with the same lines and opens it. */
export function AcceptQuoteButton({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function accept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptQuote(id);
      if (!result.ok || !result.id) {
        setError(result.error ?? "The invoice couldn't be created.");
        return;
      }
      router.push(routes.invoices.item(result.id));
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={accept}
        disabled={isPending}
        className="rounded-lg bg-primary text-primary-foreground text-[13.5px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPending ? "Creating invoice…" : "Accept and create invoice"}
      </button>
      {error && <span className="text-[12.5px] text-destructive" role="alert">{error}</span>}
    </>
  );
}
