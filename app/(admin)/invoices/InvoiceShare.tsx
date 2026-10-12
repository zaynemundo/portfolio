"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ExternalLink, Link2, Mail } from "lucide-react";
import { createInvoiceShareLink, revokeInvoiceShareLink, sendInvoiceEmail } from "@/app/actions/invoices";

interface Props {
  invoiceId: string;
  invoiceNumber: string;
  /** "invoice" or "quote" — only changes the wording. */
  noun: "invoice" | "quote";
  senderName: string;
  clientEmail: string | null;
  /** Site origin, e.g. https://example.com — worked out on the server so the link is right before hydration. */
  origin: string;
  initialToken: string | null;
  /** True once a sending domain is set up, so the site can email the client itself. */
  canSendEmail: boolean;
}

const secondaryButton =
  "inline-flex items-center gap-1.5 rounded-lg border border-border text-foreground/80 text-[12.5px] font-medium px-3 py-1.5 hover:bg-card transition-colors disabled:opacity-50";

/** Creates, copies and withdraws the private link a client uses to view and download an invoice. */
export function InvoiceShare({ invoiceId, invoiceNumber, noun, senderName, clientEmail, origin, initialToken, canSendEmail }: Props) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const url = token ? `${origin}/invoice/${token}` : "";

  function create() {
    startTransition(async () => {
      const result = await createInvoiceShareLink(invoiceId);
      setToken(result.token);
    });
  }

  function revoke() {
    if (!window.confirm(`Stop sharing this ${noun}? The link you sent will stop working.`)) return;
    startTransition(async () => {
      await revokeInvoiceShareLink(invoiceId);
      setToken(null);
      setCopied(false);
    });
  }

  function sendEmail() {
    setEmailStatus(null);
    startTransition(async () => {
      const result = await sendInvoiceEmail(invoiceId);
      if (result.token) setToken(result.token);
      setEmailStatus(
        result.ok
          ? { ok: true, message: `Sent to ${clientEmail}.` }
          : { ok: false, message: result.error ?? "The email couldn't be sent." },
      );
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — the link is still selectable in the field.
    }
  }

  const mailto = `mailto:${clientEmail ?? ""}?subject=${encodeURIComponent(`${noun === "quote" ? "Quote" : "Invoice"} ${invoiceNumber} from ${senderName}`)}&body=${encodeURIComponent(
    `Hi,\n\nPlease find ${noun} ${invoiceNumber} here. You can view it and download a PDF from this link:\n${url}\n\nThank you,\n${senderName}`,
  )}`;

  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-6 print:hidden">
      <div className="flex items-center gap-2 mb-1">
        <Link2 size={15} className="text-muted-foreground" />
        <h2 className="text-[13.5px] font-semibold text-foreground">Share with client</h2>
        {token && <span className="rounded-full bg-success/15 text-success text-[10.5px] font-semibold px-2 py-0.5">Link active</span>}
      </div>

      {!token ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted-foreground">
            Create a private link. Anyone with it can view this {noun} and download the PDF, without logging in.
          </p>
          <button
            type="button"
            onClick={create}
            disabled={isPending}
            className="rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create share link"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[12.5px] text-muted-foreground">
            Anyone with this link can view the {noun} and download the PDF. It always shows the latest version.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={url}
              aria-label="Share link"
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 min-w-[220px] rounded-lg bg-background border border-border px-3 py-1.5 text-[12.5px] font-mono text-foreground/80 focus:outline-none focus:border-ring"
            />
            <button type="button" onClick={copy} className={secondaryButton}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy link"}
            </button>
            {canSendEmail && clientEmail ? (
              <button type="button" onClick={sendEmail} disabled={isPending} className={secondaryButton}>
                <Mail size={13} />
                Send to {clientEmail}
              </button>
            ) : (
              <a href={mailto} className={secondaryButton}>
                <Mail size={13} />
                Email to client
              </a>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
              <ExternalLink size={13} />
              Preview
            </a>
            <button type="button" onClick={revoke} disabled={isPending} className={`${secondaryButton} hover:text-destructive`}>
              Stop sharing
            </button>
          </div>
          {emailStatus && (
            <p className={`text-[12.5px] ${emailStatus.ok ? "text-success" : "text-destructive"}`} role="status">
              {emailStatus.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
