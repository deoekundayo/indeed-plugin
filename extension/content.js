/**
 * Indeed page: detect job, panel UI, generate & save tailored documents.
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

  function saveDocument(role, kind, content) {
    return chrome.runtime.sendMessage({
      type: "SAVE_DOCUMENT",
      role,
      kind,
      content,
    });
  }

  function saveBoth(role, resume, coverLetter) {
    return chrome.runtime.sendMessage({
      type: "SAVE_BOTH",
      role,
      resume,
      coverLetter,
    });
  }

  async function generateAndSave(kind, job, panel) {
    const role = job.title || "Job";
    setStatus(panel, "Generating…");

    try {
      const opts = await getGenOptions();
      const content =
        kind === "resume"
          ? await IndeedDocuments.generateTailoredResume(job, opts)
          : await IndeedDocuments.generateCoverLetter(job, opts);

      const res = await saveDocument(role, kind, content);
      if (res?.error) throw new Error(res.error);
      const name = IndeedNaming.buildDocumentFilename(role, kind);
      setStatus(panel, `Saved: ${name}`);
    } catch (e) {
      setStatus(panel, e.message || "Failed to save", true);
    }
  }

  async function generateBoth(job, panel) {
    const role = job.title || "Job";
    setStatus(panel, "Generating resume & cover letter…");

    try {
      const opts = await getGenOptions();
      const [resume, coverLetter] = await Promise.all([
        IndeedDocuments.generateTailoredResume(job, opts),
        IndeedDocuments.generateCoverLetter(job, opts),
      ]);

      const res = await saveBoth(role, resume, coverLetter);
      if (res?.error) throw new Error(res.error);

      const rName = IndeedNaming.buildDocumentFilename(role, "resume");
      const cName = IndeedNaming.buildDocumentFilename(role, "cover_letter");
      setStatus(panel, `Saved: ${rName} & ${cName}`);
    } catch (e) {
      setStatus(panel, e.message || "Failed", true);
    }
  }

  function fillCoverLetter(text) {
    const selectors = [
      'textarea[name*="cover" i]',
      'textarea[id*="cover" i]',
      'textarea[aria-label*="cover" i]',
      'textarea[name*="message"]',
      "textarea",
    ];
    for (const sel of selectors) {
      const ta = document.querySelector(sel);
      if (ta) {
        ta.focus();
        ta.value = text;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        ta.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  async function fillApplication(job, panel) {
    setStatus(panel, "Generating cover letter for form…");
    try {
      const opts = await getGenOptions();
      const cover = await IndeedDocuments.generateCoverLetter(job, opts);
      if (fillCoverLetter(cover)) {
        setStatus(panel, "Cover letter pasted into form. Review before submitting.");
      } else {
        setStatus(panel, "Open the Apply form first, then click Fill again.", true);
      }
    } catch (e) {
      setStatus(panel, e.message, true);
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
        <button type="button" data-action="both" class="ija-btn ija-primary">Generate & save both</button>
        <button type="button" data-action="resume" class="ija-btn">Save tailored resume</button>
        <button type="button" data-action="cover" class="ija-btn">Save cover letter</button>
        <button type="button" data-action="fill" class="ija-btn ija-secondary">Fill apply form</button>
      </div>
      <p class="ija-hint">Resume tailored to this job: summary, skills, and projects adjust per description.</p>
      <div class="ija-status"></div>
    `;

    panel.querySelector(".ija-close").addEventListener("click", () => panel.remove());
    panel.querySelector('[data-action="both"]').addEventListener("click", () => generateBoth(job, panel));
    panel.querySelector('[data-action="resume"]').addEventListener("click", () =>
      generateAndSave("resume", job, panel)
    );
    panel.querySelector('[data-action="cover"]').addEventListener("click", () =>
      generateAndSave("cover_letter", job, panel)
    );
    panel.querySelector('[data-action="fill"]').addEventListener("click", () => fillApplication(job, panel));

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
