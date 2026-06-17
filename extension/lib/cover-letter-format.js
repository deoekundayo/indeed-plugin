/**
 * Build tailored cover letters from the base PDF structure.
 * Same content rules as resumes: truthful facts only, reworded and reorganized per job.
 */

function coverJobKeywords(job) {
  if (globalThis.IndeedResumeFormat?.jobKeywords) {
    return IndeedResumeFormat.jobKeywords(job);
  }
  const text = `${job.title || ""} ${job.company || ""} ${job.description || ""}`.toLowerCase();
  return new Set(text.match(/[a-z0-9+#.]{3,}/g) || []);
}

function coverRelevance(text, keywords) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) score += 1;
  }
  return score;
}

function coverJobFocus(job) {
  if (globalThis.IndeedResumeFormat?.extractJobFocus) {
    return IndeedResumeFormat.extractJobFocus(job);
  }
  return [];
}

function resolveHiringManager(company) {
  const name = (company || "").trim();
  if (!name || name === "Unknown company") return "Dear Hiring Manager,";
  return `Dear ${name} Hiring Manager,`;
}

function extractProjectsFromResume(tailoredResume) {
  return (tailoredResume || "")
    .split("\n")
    .filter((line) => / — .+\.(com|app|netlify)/i.test(line))
    .map((line) => line.split(" — ")[0].trim());
}

function buildTrainingSentence(keywords, job, projectNames) {
  const { TRAINING_OPTIONS } = globalThis.IndeedBaseCoverLetter;
  const combined = `${job.title || ""} ${job.description || ""}`.toLowerCase();

  const scored = TRAINING_OPTIONS.map((opt) => {
    let score = 0;
    for (const tag of opt.tags) {
      if (combined.includes(tag) || keywords.has(tag)) score += 2;
    }
    return { opt, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0).slice(0, 2);
  const picks = top.length >= 1 ? top : scored.slice(0, 2);

  const programPhrase =
    picks.length === 1
      ? picks[0].opt.text
      : `${picks
          .slice(0, -1)
          .map((s) => s.opt.text)
          .join(", ")}, and ${picks[picks.length - 1].opt.text}`;

  let sentence = `Since then, I've been actively training and building my skills through structured programs and hands-on projects. I've completed ${programPhrase}, and spent a lot of time outside of coursework practicing what I've learned.`;

  if (projectNames.length > 0) {
    const list =
      projectNames.length === 1
        ? projectNames[0]
        : `${projectNames.slice(0, -1).join(", ")} and ${projectNames[projectNames.length - 1]}`;
    sentence = sentence.replace(
      "practicing what I've learned.",
      `practicing what I've learned through projects including ${list}.`
    );
  }

  return sentence;
}

function tailorPassionParagraph(focus, job) {
  const title = (job.title || "").toLowerCase();
  const desc = (job.description || "").toLowerCase();

  if (
    focus.some((f) => ["ui", "ux", "design", "frontend", "css", "responsive", "flexbox", "grid"].includes(f)) ||
    /ui|ux|design|frontend|user experience|interface/.test(title + desc)
  ) {
    return "What I've found is that I genuinely enjoy the process of turning ideas into something people can interact with—especially when it comes to layout, design, and making sure things work well across different devices.";
  }
  if (
    focus.some((f) => ["api", "rest", "backend", "node", "express", "mongodb", "sql"].includes(f)) ||
    /backend|api|server|database/.test(title + desc)
  ) {
    return "What I've found is that I genuinely enjoy building reliable applications—connecting front-end interfaces to back-end logic, APIs, and data so features work consistently for users.";
  }
  if (focus.some((f) => ["aws", "cloud", "security"].includes(f)) || /cloud|aws|devops/.test(title + desc)) {
    return "What I've found is that I genuinely enjoy learning how systems work at scale—understanding cloud fundamentals, security concepts, and how technical solutions support real business needs.";
  }
  if (
    focus.some((f) => ["analytics", "sql", "data", "excel", "visualization"].includes(f)) ||
    /data|analyst|analytics|sql/.test(title + desc)
  ) {
    return "What I've found is that I genuinely enjoy working with data—organizing information, spotting patterns, and presenting findings in a way that helps people make better decisions.";
  }
  return "What I've found is that I genuinely enjoy the process of turning ideas into something people can interact with—building responsive applications and solving problems through hands-on development.";
}

function tailorRoleFitParagraph(job, focus) {
  const title = (job.title || "this role").trim();
  const company = (job.company || "your team").trim();
  const combined = `${title} ${job.description || ""}`.toLowerCase();

  if (/ui|ux|design/.test(combined)) {
    return `What draws me to the ${title} role at ${company} is the balance between design and implementation. It aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.`;
  }
  if (/full.?stack|software engineer|developer/.test(combined)) {
    return `What draws me to the ${title} role at ${company} is the opportunity to apply my full-stack training on meaningful projects while continuing to grow alongside experienced developers. I'm ready to contribute, collaborate, and keep building my skills in a real-world environment.`;
  }
  if (/cloud|aws/.test(combined)) {
    return `What draws me to the ${title} role at ${company} is the chance to apply my cloud training and technical foundation while continuing to develop in a professional environment. I'm eager to contribute, learn from the team, and grow in this space.`;
  }
  if (/data|analyst|analytics/.test(combined)) {
    return `What draws me to the ${title} role at ${company} is the opportunity to apply my analytics training and problem-solving skills in a practical setting. I'm ready to contribute, collaborate, and continue developing professionally.`;
  }
  if (focus.length > 0) {
    return `What draws me to the ${title} role at ${company} is how it aligns with the skills I've been building through my training and projects. I'm someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.`;
  }
  return `What draws me to this role specifically is how it aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.`;
}

function tailorOpeningParagraph(job) {
  const title = (job.title || "").trim();
  if (title) {
    return `I'm reaching out to apply for the ${title} opportunity because it represents the kind of work I've been steadily working toward over the past few years.`;
  }
  return "I'm reaching out to apply for this opportunity because it represents the kind of work I've been steadily working toward over the past few years.";
}

function tailorParagraph(paragraph, job, keywords, focus, projectNames) {
  switch (paragraph.id) {
    case "opening":
      return tailorOpeningParagraph(job);
    case "background":
      return paragraph.text;
    case "training":
      return buildTrainingSentence(keywords, job, projectNames);
    case "passion":
      return tailorPassionParagraph(focus, job);
    case "strengths":
      return paragraph.text;
    case "roleFit":
      return tailorRoleFitParagraph(job, focus);
    case "closing":
      return paragraph.text;
    case "thanks":
      return paragraph.text;
    default:
      return paragraph.text;
  }
}

function buildTailoredCoverLetterText(job, profile, tailoredResume) {
  const { COVER_LETTER_STRUCTURE } = globalThis.IndeedBaseCoverLetter;
  const keywords = coverJobKeywords(job);
  const focus = coverJobFocus(job);
  const projectNames = extractProjectsFromResume(tailoredResume);

  const salutation = resolveHiringManager(job.company);
  const body = COVER_LETTER_STRUCTURE.paragraphs.map((p) =>
    tailorParagraph(p, job, keywords, focus, projectNames)
  );

  const signOff = [
    "Sincerely,",
    profile.name,
    profile.email,
    profile.phone,
  ].join("\n");

  return `${salutation}\n\n${body.join("\n\n")}\n\n${signOff}`;
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedCoverLetterFormat = {
    buildTailoredCoverLetterText,
    coverJobKeywords,
    tailorRoleFitParagraph,
  };
}
