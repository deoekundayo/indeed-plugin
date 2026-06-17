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
  const title = job.title || "the open position";
  const company = job.company || "your organization";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const projectMentions = (tailoredResume || "")
    .split("\n")
    .filter((line) => / — .+\.(com|app|netlify)/i.test(line))
    .map((line) => line.split(" — ")[0].trim())
    .slice(0, 3);
  const projectLine =
    projectMentions.length > 0
      ? `My most relevant project experience includes ${projectMentions.join(", ")}.`
      : "My project experience includes responsive web applications built with JavaScript, React, and Node.js.";

  return `${today}

${company}
Re: ${title}

Dear Hiring Manager,

I am writing to apply for the ${title} position at ${company}. I am an entry-level full-stack developer with training through The University of Texas at Austin Full Stack Software Development Program and hands-on experience building responsive web applications using JavaScript, React, Node.js, Express, and databases.

${projectLine} I have also completed the AWS re/Start Program at Per Scholas and the Google Data Analytics Professional Certificate.

I bring strong communication and teamwork from customer service roles at Paradies Lagardère and Harris Teeter, and I am motivated to grow in a collaborative engineering environment.

Thank you for your consideration.

Sincerely,
${profile.name}
${profile.email} | ${profile.phone}
Portfolio: ${profile.portfolio}`;
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

  if (options?.openaiApiKey) {
    return generateWithOpenAI(
      options.openaiApiKey,
      options.openaiModel,
      "Write a professional cover letter. Use ONLY facts from the resume. No placeholders. Plain text.",
      `JOB: ${job.title} at ${job.company}\nDescription:\n${(job.description || "").slice(0, 2000)}\n\nTAILORED RESUME:\n${tailoredResume.slice(0, 5000)}`
    );
  }
  return buildCoverLetterTemplate(job, PROFILE, tailoredResume);
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
