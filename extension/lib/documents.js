/**
 * Tailored resume & cover letter — Word format, truthful to base resume.
 */

const RESUME_SYSTEM_PROMPT = `You tailor resumes for job applications. STRICT RULES:
1. Use EXACTLY these section titles in this order: Professional Summary, Technical Skills, Projects, Education & Training, Work Experience, Developer Mindset.
2. Header must be exactly:
ADEOLA EKUNDAYO
Charlotte, NC | 980-358-9112 | d.ekundayo63@gmail.com
LinkedIn: linkedin.com/in/adeolaekundayo
GitHub: github.com/deoekundayo
Portfolio: deosportfolio.netlify.app
3. Do NOT add employers, projects, degrees, certifications, or skills not in the base resume.
4. Do NOT paste the job description or add company-specific sections.
5. PROFESSIONAL SUMMARY: Start from this base and reword for the target job (same facts only):
"Full Stack Developer with a background in customer service and a strong commitment to building a career in technology. Completed the University of Texas at Austin Full Stack Software Development Certificate, where I gained hands-on experience developing responsive web applications and working with front-end and back-end technologies, including HTML, CSS, JavaScript, Node.js, Express.js, and REST APIs. Enjoy solving problems, learning new technologies, and creating applications that provide a positive user experience. Known for being dependable, adaptable, and eager to contribute while continuing to grow as a developer."
Adjust the role title, emphasized technologies, and phrasing to match the job description. Do not add new employers, degrees, or skills.
6. REORDER Technical Skills category lines and skills within each line to match the job. Format: Category: skill1, skill2, skill3 (one category per line).
7. PROJECTS: Include ONLY the 2–3 most relevant projects from the base resume for this job. Omit projects that do not fit. Reorder remaining projects with the best match first. Reorder bullets within each project to highlight job-relevant work. Use at most 3 bullets per project.
8. EDUCATION & TRAINING: Include the 2–4 most relevant entries for the job from: UT Austin Full Stack Certificate, AWS re/Start (Per Scholas, Aug 2024), Google Data Analytics (Sep 2023), freeCodeCamp Full Stack curriculum, CPCC Associate Degree (May 2015). Reorder by relevance. Emphasize matching bullets; max 3 per entry.
9. Work Experience and Developer Mindset must stay truthful — same employers, dates, and bullet facts.
10. Output plain text only (section title on its own line, bullets with •).

CANDIDATE BACKGROUND (use for tailoring — no new facts):
- CPCC Associate in General Education, May 2015
- UT Austin Full Stack Software Development Certificate (HTML, CSS, JS, Node, Express, APIs, responsive design)
- Per Scholas AWS re/Start Cloud Practitioner, August 2024 (AWS, cloud, IAM, security)
- Google Data Analytics Certificate, September 2023 (SQL, spreadsheets, visualization)
- freeCodeCamp Full Stack Developer curriculum (HTML, CSS, JS, responsive design, projects)
- Technical areas: web dev, cloud computing, data analytics, Git/GitHub, JSON, Flexbox, CSS Grid`;

const COVER_LETTER_SYSTEM_PROMPT = `You write cover letters for Adeola Ekundayo. Use this EXACT structure and tone (reword paragraphs for the job, same facts only):

Dear {Company} Hiring Manager,

[Opening] I'm reaching out to apply for this opportunity because it represents the kind of work I've been steadily working toward over the past few years.

[Background] My path into tech didn't start in a traditional way. Customer-facing roles at Paradies Lagardère and Harris Teeter — communication, patience, ownership — led to learning web development.

[Training] Structured programs (UT Austin Full Stack, Google Data Analytics, AWS re/Start, freeCodeCamp as relevant) and hands-on projects from the tailored resume only.

[Passion] What I enjoy — tailor to job (design/UI for frontend roles, data for analytics, cloud for AWS, etc.).

[Strengths] Consistency, work ethic, learning while working full-time, structure, documentation, style guides when relevant.

[Why this role] What draws me to {Job Title} at {Company} — align with job description.

[Close] Appreciate consideration and growing with the team.

Thank you for your time and consideration.

Sincerely,
Adeola Ekundayo
d.ekundayo63@gmail.com
980-358-9112

RULES: No date line. No "Re:" line. No placeholders. Only facts from the tailored resume. Mention only projects/certs included in the tailored resume. Do not invent experience.`;

function getBaseResumeText() {
  return IndeedResumeFormat.buildTailoredResumeText(
    { title: "", company: "", description: "" },
    IndeedBaseResume.RESUME_STRUCTURE
  );
}

function buildTailoredResumeTemplate(job) {
  return IndeedResumeFormat.buildTailoredResumeText(job, IndeedBaseResume.RESUME_STRUCTURE);
}

function buildCoverLetterTemplate(job, profile, tailoredResume) {
  return IndeedCoverLetterFormat.buildCoverLetterText(job, profile, tailoredResume);
}

async function generateWithOpenAI(apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

async function generateTailoredResume(job, options) {
  const templateResume = buildTailoredResumeTemplate(job);

  if (options?.openaiApiKey) {
    const aiResume = await generateWithOpenAI(
      options.openaiApiKey,
      options.openaiModel,
      RESUME_SYSTEM_PROMPT,
      `TARGET JOB — tailor wording, organization, and which projects to include:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription:\n${(job.description || "").slice(0, 3500)}\n\nBASE RESUME (only source of truth — no new facts):\n${getBaseResumeText()}\n\nTEMPLATE PREVIEW (job-aware selection already applied — use as guide):\n${templateResume}`
    );
    return aiResume;
  }

  return templateResume;
}

async function generateCoverLetter(job, options) {
  const { PROFILE } = globalThis.IndeedBaseResume;
  const tailoredResume = buildTailoredResumeTemplate(job);
  const templateLetter = buildCoverLetterTemplate(job, PROFILE, tailoredResume);

  if (options?.openaiApiKey) {
    return generateWithOpenAI(
      options.openaiApiKey,
      options.openaiModel,
      COVER_LETTER_SYSTEM_PROMPT,
      `TARGET JOB:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription:\n${(job.description || "").slice(0, 2500)}\n\nTAILORED RESUME (only source of truth):\n${tailoredResume.slice(0, 5000)}\n\nTEMPLATE PREVIEW (match this structure and tone):\n${templateLetter}`
    );
  }
  return templateLetter;
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedDocuments = {
    generateTailoredResume,
    generateCoverLetter,
    buildTailoredResumeTemplate,
    buildCoverLetterTemplate,
    getBaseResumeText,
  };
}
