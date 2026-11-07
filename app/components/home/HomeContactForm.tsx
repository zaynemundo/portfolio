"use client";

import { useRef, useState } from "react";
import { submitContact } from "@/app/actions/contact";

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

type Status = "idle" | "loading" | "success" | "error";

/** Contact form in the new lavender design — same server action as the old one. */
export function HomeContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [errors, setErrors] = useState<FieldErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  function validate(data: FormData): FieldErrors {
    const next: FieldErrors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const text = String(data.get("message") ?? "").trim();

    if (name.length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email.";
    if (text.length < 10) next.message = "A little more detail, please (10+ characters).";
    return next;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextErrors = validate(data);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    setErrors({});
    setStatus("loading");

    const result = await submitContact({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    });

    if (result.ok) {
      setStatus("success");
      setMessage(undefined);
      formRef.current?.reset();
      window.setTimeout(() => successRef.current?.focus(), 60);
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="flex h-full flex-col justify-center py-6">
        <span className="site-mono text-brand">Message received</span>
        <h3
          ref={successRef}
          tabIndex={-1}
          className="site-display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] text-ink focus:outline-none"
        >
          Thanks — I&apos;ll come back to you shortly.
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Your message is saved. For anything urgent, email{" "}
          <a href="mailto:zayne.mayo@gmail.com" className="text-brand underline underline-offset-4">
            zayne.mayo@gmail.com
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="site-mono-link mt-6 w-fit text-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldClass =
    "w-full border-0 border-b border-line bg-transparent pb-3 pt-2 text-[15px] text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <span className="site-mono text-ink-soft">Start a project</span>
        <span className="site-mono inline-flex items-center gap-2 text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          Replies in a day
        </span>
      </div>

      {status === "error" && message && (
        <p role="alert" className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand">
          {message}
        </p>
      )}

      <div>
        <label htmlFor="home-contact-name" className="site-mono text-ink-soft">
          Your name
        </label>
        <input
          id="home-contact-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Zayne's next client"
          aria-invalid={Boolean(errors.name)}
          className={`${fieldClass} mt-2 placeholder:normal-case`}
        />
        {errors.name && <p className="site-mono mt-2 text-brand">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="home-contact-email" className="site-mono text-ink-soft">
          Email
        </label>
        <input
          id="home-contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={Boolean(errors.email)}
          className={`${fieldClass} mt-2 placeholder:normal-case`}
        />
        {errors.email && <p className="site-mono mt-2 text-brand">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="home-contact-message" className="site-mono text-ink-soft">
          What are we making?
        </label>
        <textarea
          id="home-contact-message"
          name="message"
          rows={4}
          placeholder="A brand, a website, a campaign — or all three."
          aria-invalid={Boolean(errors.message)}
          className={`${fieldClass} mt-2 resize-none placeholder:normal-case`}
        />
        {errors.message && <p className="site-mono mt-2 text-brand">{errors.message}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          aria-busy={status === "loading"}
          className="site-pill site-pill--primary disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send message"}
          {status !== "loading" && <span className="site-arrow">↗</span>}
        </button>
        <span className="site-mono text-ink-soft">Or email directly</span>
      </div>
    </form>
  );
}
