/**
 * Build tailored resumes in the exact PDF section order.
 * Wording, organization, and project inclusion adapt to the job description.
 */

const SECTION_ORDER = [
  "Professional Summary",
  "Technical Skills",
  "Projects",
  "Education & Training",
  "Work Experience",
  "Developer Mindset",
];

const JOB_TECH_TERMS = [
  "react",
  "javascript",
  "node",
  "express",
  "mongodb",
  "sql",
  "mysql",
  "api",
  "rest",
  "frontend",
  "backend",
  "full stack",
  "full-stack",
  "responsive",
  "css",
  "html",
  "git",
  "github",
  "netlify",
  "dashboard",
  "admin",
  "survey",
  "form",
  "validation",
  "testing",
  "mocha",
  "aws",
  "cloud",
  "analytics",
  "tableau",
  "excel",
  "accessibility",
  "ui",
  "ux",
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

function extractJobFocus(job) {
  const combined = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  return JOB_TECH_TERMS.filter((term) => combined.includes(term));
}

function buildHeader(structure) {
  const h = structure.header;
  return [h.name, h.contact, h.linkedin, h.github, h.portfolio].join("\n");
}

function tailorProfessionalSummary(section, job, keywords) {
  const normalized = section.paragraph.replace(/\s+/g, " ").trim();
  const sentences = normalized.match(/[^.!?]+[.!?]+/g) || [normalized];
  const focus = extractJobFocus(job);
  const title = (job.title || "").trim();
  const safeTitle = title.replace(/[^\w\s\-\/]/g, "").slice(0, 70);

  const scored = sentences.map((s) => ({
    text: s.trim(),
    score: relevanceScore(s, keywords),
  }));
  scored.sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0);
  const pool = relevant.length >= 2 ? relevant : scored;
  const kept = pool.slice(0, Math.max(2, Math.min(pool.length, 4)));

  let lead = kept[0].text;

  if (safeTitle && /developer|engineer|programmer|analyst|designer|architect/i.test(safeTitle)) {
    if (/^Entry-level full-stack developer/i.test(lead)) {
      lead = lead.replace(
        /^Entry-level full-stack developer/i,
        `Entry-level ${safeTitle} with full-stack development experience`
      );
    } else if (!lead.toLowerCase().includes(safeTitle.toLowerCase())) {
      lead = `Motivated ${safeTitle} candidate with hands-on project experience. ${lead}`;
    }
  }

  if (focus.length > 0) {
    const focusPhrase = focus.slice(0, 4).join(", ");
    if (!focus.every((f) => lead.toLowerCase().includes(f))) {
      lead = lead.replace(
        /using JavaScript, React, Node\.js, Express, and database/i,
        `with strengths in ${focusPhrase} and related full-stack technologies`
      );
      if (lead === kept[0].text && !lead.toLowerCase().includes(focus[0])) {
        lead = `${lead.replace(/\.$/, "")}, with practical experience in ${focusPhrase}.`;
      }
    }
  }

  const ordered = [lead, ...kept.slice(1).map((x) => x.text)];
  const tailored = ordered.join(" ").replace(/\s+/g, " ").trim();

  return `${section.title}\n${tailored}`;
}

function tailorSkillLine(line, keywords) {
  const colon = line.indexOf(":");
  if (colon === -1) return line;
  const category = line.slice(0, colon + 1);
  const items = line
    .slice(colon + 1)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  items.sort((a, b) => relevanceScore(b, keywords) - relevanceScore(a, keywords));
  return `${category} ${items.join(", ")}`;
}

function buildTechnicalSkills(section, keywords) {
  const lines = [...section.lines]
    .sort((a, b) => relevanceScore(b, keywords) - relevanceScore(a, keywords))
    .map((line) => tailorSkillLine(line, keywords));
  return `${section.title}\n${lines.join("\n")}`;
}

function scoreProject(block, keywords, job) {
  const text = `${block.title} ${block.bullets.join(" ")}`;
  let score = relevanceScore(text, keywords);
  const combined = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  const blockLower = text.toLowerCase();

  if (/frontend|ui|react|css|responsive/.test(combined) && /frontend|responsive|react|css|javascript|portfolio/.test(blockLower)) {
    score += 4;
  }
  if (/backend|api|node|express|full.?stack/.test(combined) && /backend|api|express|node|rest|form/.test(blockLower)) {
    score += 4;
  }
  if (/dashboard|admin|operations/.test(combined) && /dashboard|admin|operations/.test(blockLower)) {
    score += 5;
  }
  if (/survey|form|validation|data/.test(combined) && /survey|form|validation|data/.test(blockLower)) {
    score += 5;
  }
  if (/accessibility|mobility|transport/.test(combined) && /mobility|accessibility|transport/.test(blockLower)) {
    score += 5;
  }
  if (/netlify|deploy|git/.test(combined) && /netlify|deploy|github|git/.test(blockLower)) {
    score += 2;
  }

  return score;
}

function selectProjects(blocks, keywords, job) {
  const scored = blocks.map((block) => ({
    block,
    score: scoreProject(block, keywords, job),
  }));
  scored.sort((a, b) => b.score - a.score);

  const minProjects = 2;
  const maxProjects = 3;
  const minScore = 2;

  let selected = scored.filter((s) => s.score >= minScore);
  if (selected.length < minProjects) {
    selected = scored.slice(0, minProjects);
  }
  return selected.slice(0, maxProjects).map((s) => s.block);
}

function tailorProjectBullets(block, keywords) {
  const bullets = [...block.bullets].sort(
    (a, b) => relevanceScore(b, keywords) - relevanceScore(a, keywords)
  );
  const maxBullets = 3;
  return bullets.slice(0, maxBullets);
}

function buildProjects(section, keywords, job) {
  const selected = selectProjects(section.blocks, keywords, job);
  const parts = selected.map((b) => {
    const bullets = tailorProjectBullets(b, keywords)
      .map((line) => `• ${line.replace(/^•\s*/, "")}`)
      .join("\n");
    return `${b.title}\n${bullets}`;
  });
  return `${section.title}\n${parts.join("\n")}`;
}

function buildBlockSection(section, keywords) {
  const blocks = keywords
    ? [...section.blocks].sort(
        (a, b) =>
          relevanceScore(`${a.title} ${a.bullets.join(" ")}`, keywords) -
          relevanceScore(`${b.title} ${b.bullets.join(" ")}`, keywords)
      )
    : section.blocks;

  const parts = [section.title];
  for (const b of blocks) {
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
        parts.push(buildProjects(section, keywords, job));
        break;
      case "Education & Training":
        parts.push(buildBlockSection(section, keywords));
        break;
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
    selectProjects,
    scoreProject,
  };
}
