/**
 * Base cover letter — Adeola Ekundayo (from provided PDF).
 * All cover letters start from this structure; wording adapts per job.
 */
const COVER_LETTER_STRUCTURE = {
  paragraphs: [
    {
      id: "opening",
      text: "I'm reaching out to apply for this opportunity because it represents the kind of work I've been steadily working toward over the past few years.",
    },
    {
      id: "background",
      text: "My path into tech didn't start in a traditional way. I spent several years working in customer-facing roles, where I learned how to communicate clearly, stay patient under pressure, and take ownership of my responsibilities. During that time, I realized I wanted to build something more long-term for myself, which led me to begin learning web development and design.",
    },
    {
      id: "training",
      text: "Since then, I've been actively training and building my skills through structured programs and hands-on projects. I've worked through a full stack development program, completed a data analytics certification, and spent a lot of time outside of coursework practicing what I've learned.",
    },
    {
      id: "passion",
      text: "What I've found is that I genuinely enjoy the process of turning ideas into something people can interact with—especially when it comes to layout, design, and making sure things work well across different devices.",
    },
    {
      id: "strengths",
      text: "I know there are candidates who may have more experience than I do, but what I bring is consistency, a strong work ethic, and a willingness to keep improving. I take learning seriously, and I've shown that by continuing to build my skills while working full-time. I'm also someone who values structure, organization, and doing things the right way, whether that's following a style guide or documenting my work so others can understand it.",
    },
    {
      id: "roleFit",
      text: "What draws me to this role specifically is the balance between design and implementation. It aligns with where I am in my journey right now—someone who is still growing, but ready to contribute, collaborate, and continue developing in a real-world environment.",
    },
    {
      id: "closing",
      text: "I would truly appreciate the opportunity to be considered and to continue growing within a team like yours.",
    },
    {
      id: "thanks",
      text: "Thank you for your time and consideration.",
    },
  ],
};

const TRAINING_OPTIONS = [
  {
    id: "ut-austin",
    text: "a full stack development program through the University of Texas at Austin",
    tags: ["full stack", "javascript", "node", "express", "api", "frontend", "backend", "web"],
  },
  {
    id: "google-analytics",
    text: "a Google Data Analytics certification",
    tags: ["analytics", "sql", "data", "excel", "visualization", "spreadsheet"],
  },
  {
    id: "aws",
    text: "AWS re/Start cloud practitioner training through Per Scholas",
    tags: ["aws", "cloud", "security", "devops"],
  },
  {
    id: "freecodecamp",
    text: "the freeCodeCamp Full Stack Developer curriculum",
    tags: ["html", "css", "javascript", "responsive", "frontend"],
  },
];

if (typeof globalThis !== "undefined") {
  globalThis.IndeedBaseCoverLetter = { COVER_LETTER_STRUCTURE, TRAINING_OPTIONS };
}
