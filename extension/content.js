/**
 * Indeed page: detect job, panel UI, generate & save tailored resume.
 */

(function init() {
  const PANEL_ID = "indeed-job-assistant-panel";

  function scrapeJob() {
    const title =
      textOf('[data-testid="jobsearch-JobInfoHeader-title"]') ||
      textOf("h1.jobsearch-JobInfoHeader-title") ||
      textOf("h1[class*='jobTitle']") ||
      textOf("h2.jobTitle") ||
      "";

    const company =
      textOf('[data-testid="inlineHeader-companyName"]') ||
      textOf('[data-testid="jobsearch-CompanyInfoContainer"] a') ||
      textOf("div[data-company-name]") ||
      textOf('[class*="companyName"]') ||
      "";

    const jobLocation =
      textOf('[data-testid="job-location"]') ||
      textOf('[data-testid="inlineHeader-companyLocation"]') ||
      textOf('[class*="companyLocation"]') ||
      "";

    const description =
      textOf("#jobDescriptionText") ||
      textOf('[id*="jobDescription"]') ||
      textOf(".jobsearch-jobDescriptionText") ||
      "";

    return {
      title: title.trim(),
      company: company.trim(),
      location: jobLocation.trim(),
      description: description.trim().slice(0, 8000),
      url: window.location.href,
    };
  }

  function textOf(selector) {
    const el = document.querySelector(selector);
    return el ? el.innerText : "";
  }

  function isJobPage() {
    return (
      /viewjob|jk=/.test(window.location.href) ||
      document.querySelector(
        "#jobDescriptionText, .jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title"
      )
    );
  }

  function setStatus(panel, msg, isError) {
    const el = panel.querySelector(".ija-status");
    if (el) {
      el.textContent = msg;
      el.className = "ija-status" + (isError ? " ija-error" : " ija-ok");
    }
  }

  async function getGenOptions() {
    const stored = await chrome.storage.sync.get({
      openaiApiKey: "",
      openaiModel: "gpt-4o-mini",
      useOpenAI: false,
    });
    return {
      openaiApiKey: stored.useOpenAI && stored.openaiApiKey ? stored.openaiApiKey : null,
      openaiModel: stored.openaiModel,
    };
  }

  function saveDocument(role, content) {
    return chrome.runtime.sendMessage({
      type: "SAVE_DOCUMENT",
      role,
      content,
    });
  }

  async function generateResume(job, panel) {
    const role = job.title || "Job";
    setStatus(panel, "Generating tailored resume…");

    try {
      const opts = await getGenOptions();
      const resume = await IndeedDocuments.generateTailoredResume(job, opts);
      const res = await saveDocument(role, resume);
      if (res?.error) throw new Error(res.error);
      const name = IndeedNaming.buildDocumentFilename(role);
      setStatus(panel, `Saved: ${name}`);
    } catch (e) {
      setStatus(panel, e.message || "Failed to save", true);
    }
  }

  function createPanel(job) {
    let panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();

    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="ija-header">
        <strong>Job Assistant</strong>
        <button type="button" class="ija-close" aria-label="Close">×</button>
      </div>
      <div class="ija-job">
        <div class="ija-title">${escapeHtml(job.title || "Unknown role")}</div>
        <div class="ija-company">${escapeHtml(job.company || "Unknown company")}</div>
      </div>
      <div class="ija-actions">
        <button type="button" data-action="resume" class="ija-btn ija-primary">Generate & save resume</button>
      </div>
      <p class="ija-hint">Resume tailored to this job: summary, skills, and projects adjust per description.</p>
      <div class="ija-status"></div>
    `;

    panel.querySelector(".ija-close").addEventListener("click", () => panel.remove());
    panel.querySelector('[data-action="resume"]').addEventListener("click", () => generateResume(job, panel));

    document.body.appendChild(panel);
    return panel;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function mount() {
    if (!isJobPage()) return;
    const job = scrapeJob();
    if (!job.title && !job.description) return;
    createPanel(job);
  }

  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(mount, 1200);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  mount();
})();
