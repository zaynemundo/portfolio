"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An <img> that isn't requested at all until it's about to scroll into view.
 * The browser's own loading="lazy" starts far earlier (over a screen away),
 * which on a phone lets every card's picture compete with the page's main one.
 */
export function NearImage({ margin = "200px", ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { margin?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: `${margin} 0px` });
    observer.observe(el);
    return () => observer.disconnect();
  }, [near, margin]);

  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- alt arrives in props
  if (near) return <img {...props} />;
  return <span ref={ref} className={props.className} style={{ display: "block", ...props.style }} aria-hidden />;
}
