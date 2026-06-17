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
5. REWORD the Professional Summary for the target job using only facts already in the base resume (emphasize matching skills).
6. REORDER Technical Skills category lines and Projects entries so the most job-relevant items appear first. Each skill line must use format: Category: skill1, skill2, skill3 (one category per line).
7. Education, Work Experience, and Developer Mindset must stay truthful — same employers, dates, and bullet facts.
8. Output plain text only (section title on its own line, bullets with •).`;

function getBaseResumeText() {
  return IndeedResumeFormat.buildTailoredResumeText(
    { title: "", company: "", description: "" },
    IndeedBaseResume.RESUME_STRUCTURE
  );
}

function buildTailoredResumeTemplate(job) {
  return IndeedResumeFormat.buildTailoredResumeText(job, IndeedBaseResume.RESUME_STRUCTURE);
}

function buildCoverLetterTemplate(job, profile) {
  const title = job.title || "the open position";
  const company = job.company || "your organization";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${today}

${company}
Re: ${title}

Dear Hiring Manager,

I am writing to apply for the ${title} position at ${company}. I am an entry-level full-stack developer with training through The University of Texas at Austin Full Stack Software Development Program and hands-on experience building responsive web applications using JavaScript, React, Node.js, Express, and databases.

My project experience includes Carolina Care Mobility (carolinacaremobility.com), my portfolio at deosportfolio.netlify.app, a restaurant admin dashboard demo, and the TechEdge Survey Platform. I have also completed the AWS re/Start Program at Per Scholas and the Google Data Analytics Professional Certificate.

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
      `TARGET JOB — tailor summary wording and reorder skills/projects to match:\nTitle: ${job.title}\nCompany: ${job.company}\nDescription:\n${(job.description || "").slice(0, 3500)}\n\nBASE RESUME (only source of truth — no new facts):\n${getBaseResumeText()}`
    );
    return aiResume;
  }

  return templateResume;
}

async function generateCoverLetter(job, options) {
  const { PROFILE } = globalThis.IndeedBaseResume;

  if (options?.openaiApiKey) {
    return generateWithOpenAI(
      options.openaiApiKey,
      options.openaiModel,
      "Write a professional cover letter. Use ONLY facts from the resume. No placeholders. Plain text.",
      `JOB: ${job.title} at ${job.company}\n\nRESUME:\n${getBaseResumeText().slice(0, 5000)}`
    );
  }
  return buildCoverLetterTemplate(job, PROFILE);
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
