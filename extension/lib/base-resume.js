/**
 * Base resume — Adeola Ekundayo (from provided PDF).
 * Structured to match PDF section order and content exactly.
 */
const RESUME_STRUCTURE = {
  header: {
    name: "ADEOLA EKUNDAYO",
    contact: "Charlotte, NC | 980-358-9112 | d.ekundayo63@gmail.com",
    linkedin: "LinkedIn: linkedin.com/in/adeolaekundayo",
    github: "GitHub: github.com/deoekundayo",
    portfolio: "Portfolio: deosportfolio.netlify.app",
  },
  sections: [
    {
      title: "Professional Summary",
      paragraph: `Entry-level full-stack developer with hands-on experience building responsive web applications
and interactive user interfaces through academic training and personal projects. Background in
frontend and backend development using JavaScript, React, Node.js, Express, and database
technologies, with growing experience writing test scripts, troubleshooting application issues,
and translating user needs into functional software solutions. Known for being adaptable,
collaborative, and eager to learn in team-driven technical environments.`,
    },
    {
      title: "Technical Skills",
      lines: [
        "Frontend Development: HTML5, CSS3, JavaScript (ES6+), React, Responsive Design, Bootstrap, Tailwind CSS, Progressive UI Development",
        "Backend & Databases: Node.js, Express.js, REST APIs, MongoDB, SQL, MySQL fundamentals, Backend Routing & Server Logic",
        "Testing & Development Tools: Mocha, Chai, Supertest, Git, GitHub, VS Code, Chrome DevTools, Cursor, Microsoft Copilot",
        "Workflow & Collaboration: Technical Documentation, Debugging, Agile Collaboration, Version Control, Cross-Functional Communication",
        "Currently Expanding In: Automated UI testing, relational database design, scalable application architecture, interactive browser graphics concepts",
      ],
    },
    {
      title: "Projects",
      blocks: [
        {
          title: "Carolina Care Mobility — carolinacaremobility.com",
          bullets: [
            "Collaborated on the development of a responsive transportation services platform focused on accessibility, usability, and reliable cross-device performance.",
            "Helped implement secure request forms with frontend validation and backend handling to improve submission accuracy and user experience.",
            "Assisted with scheduling-related functionality and integration of third-party tools such as maps and communication features.",
            "Participated in site optimization efforts to improve performance, usability, and overall responsiveness.",
          ],
        },
        {
          title: "Personal Portfolio Website — deosportfolio.netlify.app",
          bullets: [
            "Designed and developed a personal portfolio site to showcase web development projects, technical growth, and responsive frontend design skills.",
            "Built reusable UI sections using HTML, CSS, and JavaScript with a focus on clean navigation and mobile-friendly layouts.",
            "Deployed and maintained the application using GitHub and Netlify workflows.",
          ],
        },
        {
          title: "Restaurant Admin Dashboard Demo — resturauntadmindashboard.netlify.app",
          bullets: [
            "Created an interactive admin dashboard interface for managing restaurant operations and order-related information.",
            "Built dynamic frontend components and organized application data structures to improve usability and layout clarity.",
            "Applied responsive styling techniques and JavaScript functionality to support a smoother user experience across devices.",
          ],
        },
        {
          title: "TechEdge Survey Platform — techedgesurvey.netlify.app",
          bullets: [
            "Developed a browser-based survey application featuring interactive forms, validation logic, and real-time response handling.",
            "Organized user input workflows and structured data presentation to improve readability and engagement.",
            "Practiced debugging, testing workflows, and frontend problem-solving throughout development.",
          ],
        },
      ],
    },
    {
      title: "Education & Training",
      blocks: [
        {
          title: "Full Stack Software Development Program — The University of Texas at Austin — Completed 2026",
          bullets: [
            "Developing full-stack applications using frontend and backend technologies including JavaScript, React, Node.js, and Express.",
            "Gaining experience with application architecture, API integration, debugging, and collaborative development workflows.",
            "Building hands-on projects involving databases, routing, responsive interfaces, and software testing concepts.",
          ],
        },
        {
          title: "AWS re/Start Program — Per Scholas — Completed 2024",
          bullets: [
            "Completed hands-on technical training covering Linux systems, networking fundamentals, scripting, and cloud technologies.",
            "Strengthened troubleshooting and analytical thinking skills through collaborative technical labs and real-world scenarios.",
            "Worked in team-oriented environments requiring communication, adaptability, and structured problem solving.",
          ],
        },
        {
          title: "Google Data Analytics Professional Certificate — Completed 2023",
          bullets: [
            "Built a foundation in data interpretation, analytical thinking, and organizing technical information into actionable insights.",
            "Worked with spreadsheets, SQL, and data visualization concepts to analyze and communicate findings effectively.",
            "Strengthened attention to detail and problem-solving skills through project-based learning.",
          ],
        },
        {
          title: "Associate in General Education — Central Piedmont Community College (CPCC) — Completed 2015",
          bullets: [
            "Completed coursework emphasizing communication, critical thinking, mathematics, and written analysis.",
            "Developed strong foundational skills in organization, collaboration, and information processing.",
            "Strengthened interpersonal and professional communication through diverse academic coursework.",
          ],
        },
      ],
    },
    {
      title: "Work Experience",
      blocks: [
        {
          title: "Paradies Lagardère — Customer Service Associate | Dec 2018 – Present",
          bullets: [
            "Support fast-paced daily operations while maintaining strong communication and problem-solving skills in customer-facing environments.",
            "Execute order fulfillment and stock replenishment tasks with accuracy while helping maintain organized inventory processes.",
            "Handle customer concerns professionally and adapt quickly to changing priorities during high-traffic periods.",
            "Collaborate with team members to maintain efficient workflows and positive customer experiences.",
          ],
        },
        {
          title: "Harris Teeter — Customer Service Associate | Apr 2017 – Nov 2018",
          bullets: [
            "Assisted customers with purchases, issue resolution, and day-to-day service needs in a high-volume retail setting.",
            "Maintained accuracy while handling transactions, inventory support tasks, and customer requests simultaneously.",
            "Built strong communication and teamwork skills by coordinating with coworkers across multiple store functions.",
          ],
        },
      ],
    },
    {
      title: "Developer Mindset",
      blocks: [
        {
          title: "",
          bullets: [
            "Enjoy breaking down technical problems into manageable steps and learning through hands-on experimentation.",
            "Comfortable asking questions, researching unfamiliar technologies, and adapting quickly to new tools and workflows.",
            "Motivated by opportunities to grow in collaborative engineering environments and contribute to meaningful projects.",
          ],
        },
      ],
    },
  ],
};

const PROFILE = {
  name: "Adeola Ekundayo",
  displayName: "ADEOLA EKUNDAYO",
  email: "d.ekundayo63@gmail.com",
  phone: "980-358-9112",
  location: "Charlotte, NC",
  fieldOfStudy: "Full Stack Software Development",
  linkedin: "linkedin.com/in/adeolaekundayo",
  github: "github.com/deoekundayo",
  portfolio: "deosportfolio.netlify.app",
};

if (typeof globalThis !== "undefined") {
  globalThis.IndeedBaseResume = { PROFILE, RESUME_STRUCTURE };
}
