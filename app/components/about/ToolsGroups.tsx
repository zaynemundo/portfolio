const FALLBACK_TOOLS: Record<string, string[]> = {
  Development: ["React", "Next.js", "TypeScript", "HTML5", "CSS3", "JavaScript", "PHP"],
  Platforms: ["WordPress", "Shopify", "Elementor", "Laravel"],
  Design: ["Figma", "Adobe XD", "Adobe Creative Suite"],
  Quality: ["Git", "WCAG Auditing", "Core Web Vitals", "Technical SEO"],
};

export interface SkillItem {
  id: string;
  name: string;
  category: string;
}

interface Props {
  skills: SkillItem[];
}

export function ToolsGroups({ skills }: Props) {
  const groups: Record<string, string[]> =
    skills.length > 0
      ? skills.reduce<Record<string, string[]>>((acc, s) => {
          (acc[s.category] ??= []).push(s.name);
          return acc;
        }, {})
      : FALLBACK_TOOLS;

  return (
    <div className="about-cv__tools">
      {Object.entries(groups).map(([category, items]) => (
        <div key={category} className="about-cv__tool-group">
          <p className="about-cv__tool-category">{category}</p>
          <div className="about-cv__tool-tags">
            {items.map((name) => (
              <span key={name} className="about-cv__tool-tag">
                {name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
