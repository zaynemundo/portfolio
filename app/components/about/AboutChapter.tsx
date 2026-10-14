"use client";

import { forwardRef } from "react";
import { educationOf, type Chapter } from "@/app/data/aboutChapters";

interface Props {
  chapter: Chapter;
  index: number;
  isActive: boolean;
}

/**
 * A single About chapter article.
 *
 * The ref is forwarded to the <article> element so the parent
 * can attach an IntersectionObserver to it.
 */
export const AboutChapter = forwardRef<HTMLElement, Props>(
  function AboutChapter({ chapter, index, isActive }, ref) {
    return (
      <article
        ref={ref}
        id={`about-chapter-${chapter.id}`}
        className={`about-chapter${isActive ? " is-active" : ""}`}
        data-chapter-index={index}
        aria-label={`Chapter ${chapter.number}: ${chapter.label}`}
      >
        {/* Title */}
        <h3 className="about-chapter__title">{chapter.title}</h3>

        {/* Content varies by chapter type */}
        {chapter.type === "text" && (
          <div className="about-chapter__body">
            {chapter.paragraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        )}

        {chapter.type === "services" && (
          <>
            {chapter.introduction && (
              <p className="about-chapter__intro">{chapter.introduction}</p>
            )}
            <ul className="about-chapter__list" aria-label="Capabilities">
              {chapter.items?.map((item, i) => (
                <li key={i} className="about-chapter__list-item">
                  <span className="about-chapter__list-dot" aria-hidden="true" />
                  <span className="about-chapter__list-title">{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {chapter.type === "principles" && (
          <>
            {chapter.paragraphs && (
              <div className="about-chapter__body">
                {chapter.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            <ol className="about-chapter__principles" aria-label="Working principles">
              {chapter.principles?.map((principle, i) => (
                <li key={i} className="about-chapter__principle">
                  <p className="about-chapter__principle-title">
                    <span className="about-chapter__principle-num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {principle.title}
                  </p>
                  <p className="about-chapter__principle-body">{principle.body}</p>
                </li>
              ))}
            </ol>
          </>
        )}

        {chapter.type === "education-skills" && (
          <div className="about-chapter__edu-skills">
            {educationOf(chapter).length > 0 && (
              <div className="about-chapter__edu-block">
                {educationOf(chapter).map((edu, idx) => (
                  <div key={idx} className="about-chapter__edu-item">
                    <p className="about-chapter__edu-degree">{edu.degree}</p>
                    <p className="about-chapter__edu-meta">
                      {edu.institution}
                      {edu.honours ? ` · ${edu.honours}` : ""}
                      {edu.period ? ` (${edu.period})` : ""}
                    </p>
                    {edu.award && <p className="about-chapter__edu-award">{edu.award}</p>}
                  </div>
                ))}
              </div>
            )}

            {chapter.certificates && chapter.certificates.length > 0 && (
              <div className="about-chapter__edu-block">
                <p className="about-chapter__skill-cat">Certificates</p>
                {chapter.certificates.map((cert, idx) => (
                  <div key={idx} className="about-chapter__edu-item">
                    <p className="about-chapter__edu-degree">
                      {cert.url ? (
                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="about-chapter__edu-link">{cert.name}</a>
                      ) : (
                        cert.name
                      )}
                    </p>
                    <p className="about-chapter__edu-meta">
                      {cert.issuer}
                      {cert.year ? ` (${cert.year})` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {chapter.skillGroups && (
              <div className="about-chapter__skills-block">
                <div className="about-chapter__skill-groups">
                  {chapter.skillGroups.map((group, idx) => (
                    <div key={idx} className="about-chapter__skill-group">
                      <span className="about-chapter__skill-cat">{group.category}</span>
                      <div className="about-chapter__chips">
                        {group.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="about-chapter__chip">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </article>
    );
  },
);
