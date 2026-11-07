const TICKER_ITEMS = [
  "Graphic design",
  "Web development",
  "2D illustration",
  "Brand identity",
  "Social media",
  "SEO & growth",
  "Mockups",
  "Art direction",
];

/** Infinite mono ticker under the hero — one row, pure CSS animation. */
export function HomeTicker() {
  return (
    <div className="overflow-hidden border-y border-line bg-surface py-3.5" aria-hidden="true">
      <div className="site-marquee-track items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {TICKER_ITEMS.map((item) => (
              <span key={`${copy}-${item}`} className="site-mono flex items-center text-ink-soft">
                <span className="px-6">{item}</span>
                <span className="text-brand">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
