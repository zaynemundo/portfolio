"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Moving between pages doesn't change document.referrer, so only the first
   page of a visit says where the visitor came from. */
let firstView = true;

/** Tells /api/track about each page a visitor opens. Off on your own computer, so testing doesn't count. */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return;
    if (pathname.startsWith("/blog/preview")) return;
    const body = JSON.stringify({ path: pathname, referrer: firstView ? document.referrer : "" });
    firstView = false;
    if (!navigator.sendBeacon?.("/api/track", body)) {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
