interface Props {
  cvPath: string;
}

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M7 2v8M4.5 7.5 7 10l2.5-2.5M2 12h10"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 2h6l4 4v8H4V2Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M10 2v4h4"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

export function ProfessionalDocuments({ cvPath }: Props) {
  const docs = [
    {
      label: "Curriculum Vitae",
      description: "Full professional history, skills, and education.",
      href: cvPath,
      filename: "zaira-mundo-cv.pdf",
    },
    {
      label: "Portfolio",
      description: "Case studies and selected project work.",
      href: "/documents/zaira-mundo-portfolio.pdf",
      filename: "zaira-mundo-portfolio.pdf",
    },
  ];

  return (
    <div className="about-cv__docs">
      {docs.map((doc) => (
        <a
          key={doc.label}
          href={doc.href}
          download={doc.filename}
          className="about-cv__doc-row"
        >
          <div className="about-cv__doc-icon">
            <FileIcon />
          </div>
          <div className="about-cv__doc-info">
            <span className="about-cv__doc-label">{doc.label}</span>
            <span className="about-cv__doc-desc">{doc.description}</span>
          </div>
          <div className="about-cv__doc-arrow">
            <DownloadIcon />
          </div>
        </a>
      ))}
    </div>
  );
}
