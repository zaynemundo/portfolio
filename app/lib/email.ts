/*
 * Who outgoing email is from. Until a domain is verified in Resend, the only
 * sender available is Resend's test address, which delivers to the account
 * owner and nobody else — fine for inquiry notifications and password
 * resets, useless for emailing clients. Setting EMAIL_FROM (for example
 * "Zayne Mundo <hello@yourdomain.com>") switches every email to the real
 * address and turns on client-facing emails.
 */

const TEST_SENDER = "Zayne Mundo <onboarding@resend.dev>";

export function emailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || TEST_SENDER;
}

/** True once a real sending address is configured, so emails can reach clients. */
export function canEmailClients(): boolean {
  return Boolean(process.env.EMAIL_FROM?.trim());
}
