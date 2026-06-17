/**
 * Build tailored resumes in the exact PDF section order.
 * Truthful to base resume; summary reworded/reordered; skills & projects prioritized by job.
 */

const SECTION_ORDER = [
  "Professional Summary",
  "Technical Skills",
  "Projects",
  "Education & Training",
  "Work Experience",
  "Developer Mindset",
];

function jobKeywords(job) {
  const text = `${job.title || ""} ${job.company || ""} ${job.description || ""}`.toLowerCase();
  return new Set(text.match(/[a-z0-9+#.]{3,}/g) || []);
}

function relevanceScore(text, keywords) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 1;
  }
  return score;
}

function buildHeader(structure) {
  const h = structure.header;
  return [h.name, h.contact, h.linkedin, h.github, h.portfolio].join("\n");
}

/**
 * Reword and reorder summary sentences using job description keywords.
 * No new employers, projects, or skills — only rearrangement and light rephrasing.
 */
function tailorProfessionalSummary(section, job, keywords) {
  const normalized = section.paragraph.replace(/\s+/g, " ").trim();
  const sentences = normalized.match(/[^.!?]+[.!?]+/g) || [normalized];

  const scored = sentences.map((s) => ({
    text: s.trim(),
    score: relevanceScore(s, keywords),
  }));
  scored.sort((a, b) => b.score - a.score);

  let lead = scored[0].text;
  const title = (job.title || "").trim();
  const safeTitle = title.replace(/[^\w\s\-\/]/g, "").slice(0, 70);

  if (safeTitle && /developer|engineer|programmer|analyst|designer|architect/i.test(safeTitle)) {
    if (/^Entry-level full-stack developer/i.test(lead)) {
      lead = lead.replace(
        /^Entry-level full-stack developer/i,
        `Entry-level ${safeTitle} with full-stack development experience`
      );
    } else if (!lead.toLowerCase().includes(safeTitle.toLowerCase())) {
      lead = `Motivated ${safeTitle} candidate. ${lead}`;
    }
  }

  const ordered = [lead, ...scored.slice(1).map((x) => x.text)];
  const tailored = ordered.join(" ").replace(/\s+/g, " ").trim();

  return `${section.title}\n${tailored}`;
}

function buildTechnicalSkills(section, keywords) {
  const lines = [...section.lines].sort(
    (a, b) => relevanceScore(b, keywords) - relevanceScore(a, keywords)
  );
  return `${section.title}\n${lines.join("\n")}`;
}

function buildProjects(section, keywords) {
  const blocks = [...section.blocks].sort(
    (a, b) =>
      relevanceScore(`${a.title} ${a.bullets.join(" ")}`, keywords) -
      relevanceScore(`${b.title} ${b.bullets.join(" ")}`, keywords)
  );
  const parts = blocks.map((b) => {
    const bullets = b.bullets.map((line) => `• ${line.replace(/^•\s*/, "")}`).join("\n");
    return `${b.title}\n${bullets}`;
  });
  return `${section.title}\n${parts.join("\n")}`;
}

function buildBlockSection(section) {
  const parts = [section.title];
  for (const b of section.blocks) {
    const bullets = b.bullets.map((line) => `• ${line.replace(/^•\s*/, "")}`).join("\n");
    if (b.title && b.title.trim()) {
      parts.push(`${b.title}\n${bullets}`);
    } else {
      parts.push(bullets);
    }
  }
  return parts.join("\n");
}

function buildTailoredResumeText(job, structure) {
  const keywords = jobKeywords(job);
  const parts = [buildHeader(structure)];

  for (const section of structure.sections) {
    switch (section.title) {
      case "Professional Summary":
        parts.push(tailorProfessionalSummary(section, job, keywords));
        break;
      case "Technical Skills":
        parts.push(buildTechnicalSkills(section, keywords));
        break;
      case "Projects":
        parts.push(buildProjects(section, keywords));
        break;
      case "Education & Training":
      case "Work Experience":
      case "Developer Mindset":
        parts.push(buildBlockSection(section));
        break;
      default:
        if (section.paragraph) {
          parts.push(`${section.title}\n${section.paragraph}`);
        } else if (section.lines) {
          parts.push(`${section.title}\n${section.lines.join("\n")}`);
        }
    }
  }

  return parts.join("\n\n");
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedResumeFormat = {
    SECTION_ORDER,
    buildTailoredResumeText,
    jobKeywords,
    tailorProfessionalSummary,
  };
}
