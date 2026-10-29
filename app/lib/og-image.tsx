import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * The card shown when a page is shared on LinkedIn, WhatsApp, X and so on —
 * the site's dark header look, with the page's own title on it.
 */
export function renderOgImage({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#09090b",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 26, color: "#a1a1aa", letterSpacing: 2 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#8B5CF6", marginRight: 16 }} />
          {eyebrow.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 56 : 68,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#d4d4d8" }}>
          <div style={{ display: "flex" }}>Zayne Mundo</div>
          <div style={{ display: "flex", color: "#71717a" }}>{footer}</div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
