"use client";

import { useState, useRef, useEffect } from "react";
import { submitContact } from "../actions/contact";
import "./contact-form.css";

interface FormState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    message?: string;
  };
}

export function ContactForm() {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  /* Move focus to confirmation heading on success */
  useEffect(() => {
    if (state.status === "success" && successRef.current) {
      successRef.current.focus();
    }
  }, [state.status]);

  function validateFields(fd: FormData): FormState["fieldErrors"] | null {
    const errors: NonNullable<FormState["fieldErrors"]> = {};
    const name = (fd.get("name") as string)?.trim() ?? "";
    const email = (fd.get("email") as string)?.trim() ?? "";
    const message = (fd.get("message") as string)?.trim() ?? "";

    if (!name || name.length < 2) {
      errors.name = "Please enter your name (at least 2 characters).";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!message || message.length < 10) {
      errors.message = "Please write a message (at least 10 characters).";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    /* Client-side validation */
    const fieldErrors = validateFields(fd);
    if (fieldErrors) {
      setState({ status: "error", fieldErrors });

      /* Focus the first invalid field */
      const firstKey = Object.keys(fieldErrors)[0] as keyof typeof fieldErrors;
      const firstEl = formRef.current?.querySelector<HTMLElement>(
        `#contact-${firstKey}`,
      );
      firstEl?.focus();
      return;
    }

    setState({ status: "loading" });

    const result = await submitContact({
      name: (fd.get("name") as string) ?? "",
      email: (fd.get("email") as string) ?? "",
      message: (fd.get("message") as string) ?? "",
    });

    if (result.ok) {
      setState({ status: "success" });
      formRef.current?.reset();
    } else {
      setState({ status: "error", message: result.error });
      /* Focus first field on server error */
      formRef.current?.querySelector<HTMLElement>("#contact-name")?.focus();
    }
  }

  /* ── Success state ────────────────────────────────────────────────────── */
  if (state.status === "success") {
    return (
      <div
        className="contact-form__success"
        role="status"
        aria-live="polite"
      >
        <div className="contact-form__success-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M3 9l4.5 4.5L15 5"
              stroke="#059669"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h3
            ref={successRef}
            tabIndex={-1}
            className="contact-form__success-heading"
          >
            Message received.
          </h3>
          <p className="contact-form__success-body">
            Thank you for reaching out. I&apos;ll get back to you as soon as
            possible.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setState({ status: "idle" })}
          className="contact-form__reset-btn"
        >
          Send another message
        </button>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────────────────────── */
  const nameError = state.fieldErrors?.name;
  const emailError = state.fieldErrors?.email;
  const messageError = state.fieldErrors?.message;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="contact-form"
    >
      {/* Server error */}
      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="contact-form__alert"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="contact-form__alert-icon"
          >
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3.5M7 9.5v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {state.message}
        </div>
      )}

      {/* Name */}
      <div className="contact-form__field">
        <label
          htmlFor="contact-name"
          className={`contact-form__label${nameError ? " contact-form__label--error" : ""}`}
        >
          Name <span aria-hidden="true" className="contact-form__required">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          aria-invalid={!!nameError}
          aria-describedby={nameError ? "contact-name-error" : undefined}
          className={`contact-form__input${nameError ? " contact-form__input--error" : ""}`}
          placeholder="Your name"
        />
        {nameError && (
          <p id="contact-name-error" className="contact-form__error" role="alert">
            {nameError}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="contact-form__field">
        <label
          htmlFor="contact-email"
          className={`contact-form__label${emailError ? " contact-form__label--error" : ""}`}
        >
          Email <span aria-hidden="true" className="contact-form__required">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "contact-email-error" : undefined}
          className={`contact-form__input${emailError ? " contact-form__input--error" : ""}`}
          placeholder="you@example.com"
        />
        {emailError && (
          <p id="contact-email-error" className="contact-form__error" role="alert">
            {emailError}
          </p>
        )}
      </div>

      {/* Message */}
      <div className="contact-form__field">
        <label
          htmlFor="contact-message"
          className={`contact-form__label${messageError ? " contact-form__label--error" : ""}`}
        >
          Message <span aria-hidden="true" className="contact-form__required">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          rows={6}
          aria-invalid={!!messageError}
          aria-describedby={messageError ? "contact-message-error" : undefined}
          className={`contact-form__input contact-form__textarea${messageError ? " contact-form__input--error" : ""}`}
          placeholder="Tell me about your project or opportunity..."
        />
        {messageError && (
          <p id="contact-message-error" className="contact-form__error" role="alert">
            {messageError}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={state.status === "loading"}
        aria-busy={state.status === "loading"}
        className="contact-form__submit"
      >
        {state.status === "loading" ? (
          <>
            <svg
              className="contact-form__spinner"
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              aria-hidden="true"
              role="img"
            >
              <circle
                cx="7.5"
                cy="7.5"
                r="6"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray="30"
                strokeDashoffset="10"
              />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send message
            <svg
              className="contact-form__submit-arrow"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 6h7M6 2.5L9.5 6 6 9.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>

      <p className="contact-form__alt">
        Prefer email?{" "}
        <a
          href="mailto:mzaira.mundo@gmail.com"
          className="contact-form__alt-link"
        >
          mzaira.mundo@gmail.com
        </a>
      </p>
    </form>
  );
}
