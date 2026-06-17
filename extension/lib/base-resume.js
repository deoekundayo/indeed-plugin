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
      paragraph: `Full Stack Developer with a background in customer service and a strong commitment to building a career in technology. Completed the University of Texas at Austin Full Stack Software Development Certificate, where I gained hands-on experience developing responsive web applications and working with front-end and back-end technologies, including HTML, CSS, JavaScript, Node.js, Express.js, and REST APIs. Enjoy solving problems, learning new technologies, and creating applications that provide a positive user experience. Known for being dependable, adaptable, and eager to contribute while continuing to grow as a developer.`,
    },
    {
      title: "Technical Skills",
      lines: [
        "Languages: HTML5, CSS3, JavaScript (ES6+)",
        "Frontend Development: Responsive Web Design, Flexbox, CSS Grid, React, Bootstrap, Tailwind CSS",
        "Backend Development: Node.js, Express.js, REST APIs, JSON, MongoDB, SQL, MySQL fundamentals",
        "Cloud Computing: AWS core services and cloud concepts, identity and access management fundamentals, cloud security basics",
        "Data Analytics: SQL, data visualization, spreadsheet analysis, business data interpretation",
        "Tools & Technologies: Git, GitHub, VS Code, Chrome DevTools, Cursor, Netlify, Mocha, Chai, Supertest",
        "Workflow & Collaboration: Technical Documentation, Debugging, Agile Collaboration, Version Control, Cross-Functional Communication",
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
          title: "Full Stack Software Development Certificate — University of Texas at Austin — Completed",
          tags: ["full stack", "javascript", "node", "express", "api", "rest", "responsive", "frontend", "backend", "html", "css"],
          bullets: [
            "Training included front-end and back-end web development concepts, responsive web design, JavaScript, Node.js, Express.js, APIs, and software development practices.",
            "Gained hands-on experience developing responsive web applications and applying collaborative development workflows.",
            "Built project experience with routing, interfaces, debugging, and full-stack application fundamentals.",
          ],
        },
        {
          title: "AWS re/Start Cloud Practitioner Training — Per Scholas — Completed August 2024",
          tags: ["aws", "cloud", "security", "linux", "networking"],
          bullets: [
            "Covered cloud computing fundamentals, AWS services, professional development, and technical career readiness.",
            "Studied AWS core services, identity and access management fundamentals, and cloud security basics.",
            "Strengthened troubleshooting and analytical thinking through collaborative technical labs.",
          ],
        },
        {
          title: "Google Data Analytics Professional Certificate — Google Career Certificates — Completed September 2023",
          tags: ["analytics", "sql", "data", "excel", "tableau", "visualization", "spreadsheet"],
          bullets: [
            "Training in data analysis, spreadsheets, SQL, data visualization, and analytics workflows.",
            "Practiced spreadsheet analysis, business data interpretation, and communicating analytical findings.",
            "Strengthened attention to detail and structured problem-solving through project-based learning.",
          ],
        },
        {
          title: "freeCodeCamp — Full Stack Developer Curriculum — Self-Directed Learning",
          tags: ["html", "css", "javascript", "responsive", "frontend", "full stack", "git"],
          bullets: [
            "Completed coursework in HTML, CSS, JavaScript, and Responsive Web Design.",
            "Built web development projects applying front-end fundamentals and version control with Git & GitHub.",
            "Continued self-directed technical education alongside formal certificate programs.",
          ],
        },
        {
          title: "Associate Degree in General Education — Central Piedmont Community College (CPCC) — Graduated May 2015",
          tags: ["education", "communication", "mathematics"],
          bullets: [
            "Broad academic foundation across humanities, social sciences, natural sciences, and mathematics.",
            "Developed strong communication, critical thinking, and written analysis skills.",
            "Strengthened organization, collaboration, and professional communication through diverse coursework.",
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
  learning: {
    degrees: ["Associate Degree in General Education — CPCC — May 2015"],
    certificates: [
      "UT Austin Full Stack Software Development Certificate",
      "AWS re/Start Cloud Practitioner — Per Scholas — August 2024",
      "Google Data Analytics Professional Certificate — September 2023",
      "freeCodeCamp Full Stack Developer curriculum",
    ],
  },
};

if (typeof globalThis !== "undefined") {
  globalThis.IndeedBaseResume = { PROFILE, RESUME_STRUCTURE };
}
