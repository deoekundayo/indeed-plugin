/**
 * Cover letter format — based on Adeola's UI/UX Engineer letter.
 * Same truthfulness rules as resumes; wording adapts to the job description.
 */

function jobKeywords(job) {
  return IndeedResumeFormat.jobKeywords(job);
}

function extractCoverLetterFocus(job) {
  const combined = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  return {
    isDesign: /ui|ux|design|figma|layout|accessibility|responsive|frontend|css|user experience/i.test(combined),
    isBackend: /backend|api|rest|node|express|server|database|sql|mongodb/i.test(combined),
    isFullStack: /full.?stack|software engineer|web developer/i.test(combined),
    isData: /data|analyst|analytics|sql|visualization|bi/i.test(combined),
    isCloud: /aws|cloud|devops|infrastructure/i.test(combined),
    title: (job.title || "").trim(),
    company: (job.company || "your organization").trim(),
    description: (job.description || "").slice(0, 2000),
  };
}

function projectsFromResume(tailoredResume) {
  return (tailoredResume || "")
    .split("\n")
    .filter((line) => / — .+\.(com|app|netlify)/i.test(line))
    .map((line) => line.split(" — ")[0].trim());
}

function educationHighlights(tailoredResume, focus) {
  const lines = (tailoredResume || "").split("\n");
  const highlights = [];
  for (const line of lines) {
    if (/Texas at Austin/i.test(line)) highlights.push("a full stack development program through the University of Texas at Austin");
    if (/Google Data Analytics/i.test(line)) highlights.push("a data analytics certification");
    if (/AWS re\/Start/i.test(line)) highlights.push("AWS re/Start cloud practitioner training");
    if (/freeCodeCamp/i.test(line)) highlights.push("self-directed full stack coursework through freeCodeCamp");
  }

  if (highlights.length === 0) {
    if (focus.isData) return ["a data analytics certification and structured technical training"];
    if (focus.isCloud) return ["AWS re/Start cloud practitioner training and full stack development coursework"];
    return ["a full stack development program and a data analytics certification"];
  }

  const unique = [...new Set(highlights)];
  if (unique.length === 1) return unique;
  if (unique.length === 2) return [`${unique[0]} and ${unique[1]}`];
  return [`${unique.slice(0, -1).join(", ")}, and ${unique[unique.length - 1]}`];
}

function buildEnjoymentParagraph(focus) {
  if (focus.isDesign) {
    return "What I've found is that I genuinely enjoy the process of turning ideas into something people can interact with—especially when it comes to layout, design, and making sure things work well across different devices.";
  }
  if (focus.isData) {
    return "What I've found is that I genuinely enjoy working with data—organizing information, identifying patterns, and presenting insights in a way that helps people make better decisions.";
  }
  if (focus.isCloud) {
    return "What I've found is that I genuinely enjoy learning how systems work behind the scenes—especially when it comes to cloud concepts, reliability, and building solutions that scale responsibly.";
  }
  if (focus.isBackend) {
    return "What I've found is that I genuinely enjoy building the logic and structure behind applications—especially when it comes to APIs, backend workflows, and making sure systems function reliably.";
  }
  return "What I've found is that I genuinely enjoy the process of turning ideas into something people can interact with—especially when it comes to building responsive applications and seeing a project come together from start to finish.";
}

function buildRoleDrawParagraph(focus) {
  const title = focus.title || "this role";
  if (focus.isDesign) {
    return `What draws me to the ${title} position specifically is the balance between design and implementation. It aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.`;
  }
  if (focus.isData) {
    return `What draws me to the ${title} position specifically is the opportunity to apply analytical thinking in a practical setting. It aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, learn, and continue developing in a real-world environment.`;
  }
  if (focus.isCloud) {
    return `What draws me to the ${title} position specifically is the chance to grow within cloud and technical environments. It aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.`;
  }
  if (focus.isBackend) {
    return `What draws me to the ${title} position specifically is the focus on building reliable, well-structured applications. It aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.`;
  }
  return `What draws me to the ${title} position specifically is the opportunity to keep growing while contributing to meaningful work. It aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.`;
}

function buildTrainingParagraph(focus, tailoredResume) {
  const training = educationHighlights(tailoredResume, focus);
  const projects = projectsFromResume(tailoredResume);
  let projectNote = "";
  if (projects.length > 0) {
    const list = projects.length === 1 ? projects[0] : `${projects.slice(0, -1).join(", ")}, and ${projects[projects.length - 1]}`;
    projectNote = ` My recent project work includes ${list}, where I've applied HTML, CSS, JavaScript, and responsive design principles in practical settings.`;
  }

  return `Since then, I've been actively training and building my skills through structured programs and hands-on projects. I've worked through ${training[0]}, and spent a lot of time outside of coursework practicing what I've learned.${projectNote}`;
}

function buildCoverLetterText(job, profile, tailoredResume) {
  const focus = extractCoverLetterFocus(job);
  const company = focus.company || "your organization";
  const salutation = `Dear ${company} Hiring Manager,`;

  const paragraphs = [
    "I'm reaching out to apply for this opportunity because it represents the kind of work I've been steadily working toward over the past few years.",
    "My path into tech didn't start in a traditional way. I spent several years working in customer-facing roles at Paradies Lagardère and Harris Teeter, where I learned how to communicate clearly, stay patient under pressure, and take ownership of my responsibilities. During that time, I realized I wanted to build something more long-term for myself, which led me to begin learning web development and design.",
    buildTrainingParagraph(focus, tailoredResume),
    buildEnjoymentParagraph(focus),
    "I know there are candidates who may have more experience than I do, but what I bring is consistency, a strong work ethic, and a willingness to keep improving. I take learning seriously, and I've shown that by continuing to build my skills while working full-time. I'm also someone who values structure, organization, and doing things the right way, whether that's following a style guide or documenting my work so others can understand it.",
    buildRoleDrawParagraph(focus),
    `I would truly appreciate the opportunity to be considered and to continue growing within a team like yours at ${company}.`,
    "Thank you for your time and consideration.",
  ];

  const signOff = [
    "Sincerely,",
    profile.name,
    profile.email,
    profile.phone,
  ];

  return `${salutation}\n\n${paragraphs.join("\n\n")}\n\n${signOff.join("\n")}`;
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedCoverLetterFormat = {
    buildCoverLetterText,
    extractCoverLetterFocus,
  };
}
