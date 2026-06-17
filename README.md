# Indeed Plugin

Chrome extension for **Adeola Ekundayo** that tailors your resume on Indeed job pages, then saves a **Microsoft Word** file you can review before applying.

Base resume: your provided PDF (text embedded in the extension; original at `extension/assets/Adeola_Ekundayo_base_resume.pdf`).

## File naming

Each job uses the role title from the Indeed listing:

| Document | Filename example |
|----------|------------------|
| Resume | `Adeola_Ekundayo_Full_Stack_Developer_resume.doc` |

Spaces and special characters in the role become underscores.

## Install (unpacked)

1. Open Chrome → **Extensions** → **Manage extensions**
2. Enable **Developer mode**
3. **Load unpacked** → select the `extension` folder:
   `/Users/owner/indeed-plugin/extension`
4. Pin **Indeed Job Assistant** from the toolbar

## Use on Indeed

1. Log in to [indeed.com](https://www.indeed.com) in Chrome.
2. Open any **job posting** (full job view page).
3. A **Job Assistant** panel appears on the right:
   - **Generate & save resume** — tailored resume for this job
4. Chrome shows a **Save As** dialog for the Word file so you can pick where to save and open it to review.

## Tailoring rules

| Section | Behavior |
|---------|----------|
| Professional Summary | Reworded and reordered to match the job (same facts only) |
| Technical Skills | Same lines, most relevant listed first |
| Projects | Same projects and bullets, most relevant listed first |
| Education, Work Experience, Developer Mindset | Unchanged from your base resume |

## Optional: OpenAI tailoring

1. Extension icon → **Settings**
2. Enable **Use OpenAI** and add your API key
3. Without OpenAI, templates tailor content from your base resume

## Project layout

```
extension/
  manifest.json
  content.js          # Indeed UI panel
  background.js       # Saves Word downloads
  lib/
    base-resume.js    # Adeola's resume structure
    resume-format.js  # Job-based tailoring
    documents.js      # Generate resume
    word-export.js    # Word (.doc) export
    naming.js         # Adeola_Ekundayo_{Role}_resume.doc
  assets/
    Adeola_Ekundayo_base_resume.pdf
  options.html        # OpenAI settings
```

## Legacy CLI

The Python CLI (`indeed-assistant`) in `src/` is optional and not required for the extension.

## Notes

- Review every document before applying; keep claims truthful.
- Indeed has no official job-seeker API; this extension runs only while you browse Indeed.
- After code changes: `chrome://extensions` → **Reload** on the extension.
