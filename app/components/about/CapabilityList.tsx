const capabilities = [
  "Front-end development (React, Next.js, TypeScript)",
  "Responsive interface implementation",
  "WordPress development",
  "Shopify development",
  "Accessibility and performance optimisation",
  "Technical SEO foundations",
  "Digital content and experience support",
];

export function CapabilityList() {
  return (
    <>
      <p className="about-cv__chapter-intro">
        My work sits between visual design, front-end implementation, content
        structure, and long-term website usability.
      </p>
      <ul className="about-cv__list" aria-label="Capabilities">
        {capabilities.map((item, i) => (
          <li key={i} className="about-cv__list-item">
            <span className="about-cv__list-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}
