"use client";

import Image from "next/image";

interface PortraitConfig {
  objectPosition: string;
  scale: number;
}

const STATES: Record<string, PortraitConfig> = {
  profile: { objectPosition: "50% 22%", scale: 1.02 },
  capabilities: { objectPosition: "50% 28%", scale: 1.03 },
  experience: { objectPosition: "50% 26%", scale: 1.01 },
  tools: { objectPosition: "50% 30%", scale: 1.0 },
};

interface Props {
  /** One of the portraitState values from aboutChapters.ts */
  state: string;
  /** Uploaded portrait URL from SiteSettings, or null to show placeholder */
  portraitUrl?: string | null;
}

export function AboutPortrait({ state, portraitUrl }: Props) {
  const normalizedState =
    state === "intro" || state === "profile"
      ? "profile"
      : state === "services" || state === "capabilities" || state === "what-i-do"
        ? "capabilities"
        : state === "principles" || state === "experience"
          ? "experience"
          : "tools";

  const config = STATES[normalizedState] ?? STATES.profile;

  return (
    <div className={`about-portrait about-portrait--${normalizedState}`}>
      <div className="about-portrait__frame">
        {portraitUrl ? (
          <Image
            src={portraitUrl}
            alt="Portrait of Zayne Mundo"
            fill
            sizes="(max-width: 1023px) 80vw, (max-width: 1200px) 40vw, 480px"
            className="about-portrait__image"
            style={{
              objectFit: "cover",
              objectPosition: config.objectPosition,
              transform: `scale(${config.scale})`,
              transformOrigin: "center top",
            }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          /* Placeholder when no portrait has been uploaded yet */
          <div className="about-portrait__placeholder" aria-label="Portrait of Zayne Mundo">
            <span aria-hidden="true">ZM</span>
          </div>
        )}
      </div>
    </div>
  );
}
