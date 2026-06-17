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
  "flexbox",
  "grid",
  "json",
  "spreadsheet",
  "visualization",
  "iam",
  "security",
  "freecodecamp",
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

function resolveSummaryRole(jobTitle) {
  const title = (jobTitle || "").trim().replace(/[^\w\s\-\/]/g, "").slice(0, 70);
  if (!title) return "Full Stack Developer";
  if (/developer|engineer|programmer|analyst|architect|designer/i.test(title)) return title;
  return "Full Stack Developer";
}

function buildSummaryTechList(focus, keywords) {
  const core = ["HTML", "CSS", "JavaScript", "Node.js", "Express.js", "REST APIs"];
  const optional = ["React", "MongoDB", "SQL", "Git", "GitHub", "MySQL"];
  const pool = [...core];

  for (const tech of optional) {
    const key = tech.toLowerCase();
    if (
      (focus.includes(key) || relevanceScore(key, keywords) > 0) &&
      !pool.some((p) => p.toLowerCase() === key)
    ) {
      pool.push(tech);
    }
  }

  pool.sort((a, b) => relevanceScore(b, keywords) - relevanceScore(a, keywords));
  return pool.slice(0, 8).join(", ");
}

function tailorSummarySentence(sentence, job, focus, keywords, techList) {
  const title = resolveSummaryRole(job.title);
  let text = sentence;

  if (/^Full Stack Developer with a background/i.test(text)) {
    text = text.replace(/^Full Stack Developer/, title);
    return text;
  }

  if (/Completed the University of Texas at Austin/i.test(text)) {
    return `Completed the University of Texas at Austin Full Stack Software Development Certificate, where I gained hands-on experience developing responsive web applications and working with front-end and back-end technologies, including ${techList}.`;
  }

  if (/^Enjoy solving problems/i.test(text)) {
    if (focus.some((f) => ["analytics", "sql", "data", "excel", "visualization", "spreadsheet"].includes(f))) {
      return "Enjoy analyzing data, learning new tools, and translating technical information into clear, actionable insights.";
    }
    if (focus.some((f) => ["aws", "cloud", "security"].includes(f))) {
      return "Enjoy solving technical problems, learning cloud and security concepts, and building reliable solutions.";
    }
    if (focus.some((f) => ["react", "frontend", "css", "html", "ui", "ux", "responsive", "flexbox", "grid"].includes(f))) {
      return "Enjoy solving front-end challenges, learning new technologies, and creating responsive applications that provide a positive user experience.";
    }
    if (focus.some((f) => ["node", "express", "api", "rest", "backend", "mongodb", "sql"].includes(f))) {
      return "Enjoy solving technical problems, learning new back-end tools, and building reliable applications that provide a positive user experience.";
    }
    return text;
  }

  if (/^Known for being dependable/i.test(text)) {
    if (focus.includes("react") || focus.includes("javascript")) {
      return "Known for being dependable, adaptable, and eager to contribute on development teams while continuing to grow as a developer.";
    }
    return text;
  }

  return text;
}

function tailorProfessionalSummary(section, job, keywords) {
  const normalized = section.paragraph.replace(/\s+/g, " ").trim();
  const sentences = normalized.match(/[^.!?]+[.!?]+/g) || [normalized];
  const focus = extractJobFocus(job);
  const techList = buildSummaryTechList(focus, keywords);

  const tailored = sentences.map((s) =>
    tailorSummarySentence(s.trim(), job, focus, keywords, techList)
  );

  const body = tailored.join(" ").replace(/\s+/g, " ").trim();
  return `${section.title}\n${body}`;
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

function buildTechnicalSkills(section, keywords, job) {
  const focus = extractJobFocus(job);
  let lines = [...section.lines];

  if (focus.some((f) => ["aws", "cloud", "security"].includes(f))) {
    lines = lines.sort((a, b) => {
      const aCloud = /^Cloud Computing:/i.test(a) ? 10 : 0;
      const bCloud = /^Cloud Computing:/i.test(b) ? 10 : 0;
      return bCloud + relevanceScore(b, keywords) - (aCloud + relevanceScore(a, keywords));
    });
  }
  if (focus.some((f) => ["analytics", "sql", "data", "excel", "visualization"].includes(f))) {
    lines = lines.sort((a, b) => {
      const aData = /^Data Analytics:/i.test(a) ? 10 : 0;
      const bData = /^Data Analytics:/i.test(b) ? 10 : 0;
      return bData + relevanceScore(b, keywords) - (aData + relevanceScore(a, keywords));
    });
  }

  lines = lines
    .sort((a, b) => relevanceScore(b, keywords) - relevanceScore(a, keywords))
    .map((line) => tailorSkillLine(line, keywords));
  return `${section.title}\n${lines.join("\n")}`;
}

function scoreEducationBlock(block, keywords, job) {
  const text = `${block.title} ${block.bullets.join(" ")}`;
  let score = relevanceScore(text, keywords);
  const combined = `${job.title || ""} ${job.description || ""}`.toLowerCase();

  if (block.tags) {
    for (const tag of block.tags) {
      if (combined.includes(tag) || keywords.has(tag)) score += 2;
    }
  }

  if (/full.?stack|software|developer|engineer|web|frontend|backend/.test(combined) && /Texas at Austin|freeCodeCamp/i.test(block.title)) {
    score += 6;
  }
  if (/cloud|aws|devops|infrastructure/.test(combined) && /AWS re\/Start|Per Scholas/i.test(block.title)) {
    score += 6;
  }
  if (/data|analyst|analytics|sql|bi|business intelligence/.test(combined) && /Google Data Analytics/i.test(block.title)) {
    score += 6;
  }
  if (/freecodecamp|self.?taught|bootcamp/.test(combined) && /freeCodeCamp/i.test(block.title)) {
    score += 4;
  }

  return score;
}

function selectEducationBlocks(blocks, keywords, job) {
  const scored = blocks.map((block) => ({
    block,
    score: scoreEducationBlock(block, keywords, job),
  }));
  scored.sort((a, b) => b.score - a.score);

  const minEntries = 2;
  const maxEntries = 4;
  let selected = scored.filter((s) => s.score >= 3);
  if (selected.length < minEntries) {
    selected = scored.slice(0, minEntries);
  }
  return selected.slice(0, maxEntries).map((s) => s.block);
}

function tailorEducationBullets(block, keywords) {
  return [...block.bullets]
    .sort((a, b) => relevanceScore(b, keywords) - relevanceScore(a, keywords))
    .slice(0, 3);
}

function buildEducationSection(section, keywords, job) {
  const selected = selectEducationBlocks(section.blocks, keywords, job);
  const parts = [section.title];
  for (const b of selected) {
    const bullets = tailorEducationBullets(b, keywords)
      .map((line) => `• ${line.replace(/^•\s*/, "")}`)
      .join("\n");
    parts.push(`${b.title}\n${bullets}`);
  }
  return parts.join("\n");
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
        parts.push(buildTechnicalSkills(section, keywords, job));
        break;
      case "Projects":
        parts.push(buildProjects(section, keywords, job));
        break;
      case "Education & Training":
        parts.push(buildEducationSection(section, keywords, job));
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
    selectEducationBlocks,
    scoreEducationBlock,
  };
}
