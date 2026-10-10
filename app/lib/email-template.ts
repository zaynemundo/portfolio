/**
 * Shared branded shell for every transactional email (inquiry notification,
 * password reset). Table layout + inline styles only — email clients ignore
 * stylesheets, flexbox, and most modern CSS.
 */

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const BRAND = "#785EF7";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Solid brand-coloured call-to-action button. `href` and `label` must already be safe/escaped. */
export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="border-radius:8px;background:${BRAND}">
                <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;border-radius:8px">${label}</a>
              </td>
            </tr>
          </table>`;
}

interface EmailShellOptions {
  /** Hidden inbox-preview line shown next to the subject. */
  preheader: string;
  /** Small pill above the title, e.g. "New inquiry". */
  badge: string;
  title: string;
  /** Inner HTML of the white body card, below the title. */
  body: string;
  /** Inner HTML of the footer note. */
  footer: string;
  /** Optional small text on the right of the dark header, e.g. a timestamp. */
  headerNote?: string;
}

export function emailShell({ preheader, badge, title, body, footer, headerNote }: EmailShellOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${FONT}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">

        <!-- Header -->
        <tr><td style="background:#080612;border-radius:14px 14px 0 0;padding:26px 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="36" height="36" align="center" valign="middle" style="width:36px;height:36px;background:${BRAND};border-radius:10px;font-family:${FONT};font-size:11px;font-weight:800;color:#ffffff;letter-spacing:-0.03em;line-height:36px">ZM</td>
              <td valign="middle" style="padding-left:12px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;letter-spacing:-0.01em">Zaira Mundo</td>
              <td align="right" valign="middle" style="font-family:${FONT};font-size:11px;color:#8b8a94">${headerNote ?? ""}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Accent bar -->
        <tr><td style="background:${BRAND};height:3px;line-height:3px;font-size:0">&nbsp;</td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px 32px 30px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;font-family:${FONT}">
          <span style="display:inline-block;background:#ede9fe;color:#6248e0;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:999px">${badge}</span>
          <h1 style="margin:12px 0 24px;font-size:22px;font-weight:800;color:#09090b;letter-spacing:-0.03em;line-height:1.25">${title}</h1>
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#fafafa;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 14px 14px;padding:20px 32px;text-align:center">
          <p style="margin:0;font-family:${FONT};font-size:11px;color:#a1a1aa;line-height:1.6">${footer}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
