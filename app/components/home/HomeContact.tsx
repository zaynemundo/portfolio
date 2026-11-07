import { SectionHead } from "./SectionHead";
import { HomeContactForm } from "./HomeContactForm";

interface Props {
  email: string;
  phone: string;
  cvPath: string;
}

/** Contact — the closing statement, direct details, and the working form. */
export function HomeContact({ email, phone, cvPath }: Props) {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-line bg-paper-deep">
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-glow/30 blur-[120px]"
        aria-hidden="true"
      />
      <div className="site-container relative py-24 md:py-32">
        <SectionHead index="(06)" label="Contact" className="site-reveal" />

        <div className="mt-10 grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          <div className="site-reveal">
            <p className="site-mono inline-flex items-center gap-2 text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              Available for freelance — Dubai, UAE
            </p>
            <h2 className="site-display mt-5 text-[clamp(2.6rem,5.6vw,5.4rem)] text-ink">
              Let&apos;s make something <em>worth remembering</em>.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
              Tell me what you&apos;re building. I&apos;ll reply with honest thoughts on scope,
              timeline and the fastest way to something worth sharing.
            </p>

            <dl className="mt-10 flex flex-col gap-4 border-t border-line pt-7">
              <div className="flex items-baseline justify-between gap-6">
                <dt className="site-mono text-ink-soft">Email</dt>
                <dd>
                  <a href={`mailto:${email}`} className="site-link text-sm font-medium text-ink">
                    {email}
                  </a>
                </dd>
              </div>
              {phone && (
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="site-mono text-ink-soft">Phone</dt>
                  <dd>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="site-link text-sm font-medium text-ink">
                      {phone}
                    </a>
                  </dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-6">
                <dt className="site-mono text-ink-soft">Resume</dt>
                <dd>
                  <a href={cvPath} download className="site-link text-sm font-medium text-ink">
                    Download PDF
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="site-reveal rounded-[2rem] border border-line bg-surface p-6 shadow-[0_30px_80px_-50px_rgba(42,22,71,0.45)] md:p-9">
            <HomeContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
