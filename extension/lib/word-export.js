/**
 * Build Microsoft Word files (.doc) from plain text — opens in Word for review.
 */

const RESUME_NAME = "ADEOLA EKUNDAYO";
const HEADER_LINE_COUNT = 5;
const TIGHT = "margin:0;line-height:1.15;";
const SECTION_GAP = "margin:12pt 0 0 0;line-height:1.15;";

const RESUME_HEADERS = new Set([
  "Professional Summary",
  "Technical Skills",
  "Projects",
  "Education & Training",
  "Work Experience",
  "Developer Mindset",
]);

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isContactLine(line, index) {
  if (index === 0) return false;
  if (index >= HEADER_LINE_COUNT) return false;
  return (
    line.includes("|") ||
    /^LinkedIn:/i.test(line) ||
    /^GitHub:/i.test(line) ||
    /^Portfolio:/i.test(line)
  );
}

function isSkillCategoryLine(line) {
  const t = line.trim();
  if (!t || t.startsWith("•")) return false;
  if (/ — | \| Completed /.test(t)) return false;
  if (/\.(com|app|netlify)/i.test(t)) return false;
  const colon = t.indexOf(":");
  return colon > 0 && colon < 50 && t.length > colon + 2;
}

function skillCategoryHtml(line) {
  const colon = line.indexOf(":");
  const category = line.slice(0, colon + 1);
  const skills = line.slice(colon + 1).trim();
  return `<p style="${TIGHT}"><b>${escapeHtml(category)}</b> ${escapeHtml(skills)}</p>`;
}

function isSubheaderLine(line, index) {
  const t = line.trim();
  if (!t || t.startsWith("•")) return false;
  if (RESUME_HEADERS.has(t)) return false;
  if (index < HEADER_LINE_COUNT) return false;
  return / — | \| Completed |\.(com|app|netlify)/i.test(t);
}

function textToHtmlBody(text) {
  const lines = String(text || "").split("\n");
  const parts = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === RESUME_NAME && i === 0) {
      parts.push(
        `<p style="font-size:18pt;font-weight:bold;${TIGHT}text-transform:uppercase;">${escapeHtml(trimmed)}</p>`
      );
      i += 1;
      continue;
    }

    if (isContactLine(trimmed, i)) {
      parts.push(`<p style="${TIGHT}">${escapeHtml(trimmed)}</p>`);
      i += 1;
      continue;
    }

    if (RESUME_HEADERS.has(trimmed)) {
      parts.push(
        `<p style="font-size:12pt;font-weight:bold;${SECTION_GAP}text-transform:uppercase;">${escapeHtml(trimmed)}</p>`
      );
      i += 1;
      continue;
    }

    if (isSkillCategoryLine(trimmed)) {
      parts.push(skillCategoryHtml(trimmed));
      i += 1;
      continue;
    }

    if (isSubheaderLine(trimmed, i)) {
      parts.push(`<p style="font-weight:bold;${TIGHT}">${escapeHtml(trimmed)}</p>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("•")) {
      parts.push(`<p style="margin:0 0 0 12pt;line-height:1.15;">${escapeHtml(trimmed)}</p>`);
      i += 1;
      continue;
    }

    const para = [trimmed];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !RESUME_HEADERS.has(lines[i].trim()) &&
      !isSkillCategoryLine(lines[i].trim()) &&
      !isSubheaderLine(lines[i].trim(), i) &&
      !lines[i].trim().startsWith("•") &&
      !isContactLine(lines[i].trim(), i)
    ) {
      para.push(lines[i].trim());
      i += 1;
    }
    parts.push(`<p style="${TIGHT}">${escapeHtml(para.join(" "))}</p>`);
  }

  return parts.join("\n");
}

function textToDocxBlob(text, title) {
  const body = textToHtmlBody(text);
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title || "Document")}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.35; margin: 0.75in; }
  p { margin: 0; }
</style>
</head>
<body>${body}</body>
</html>`;

  return new Blob(["\ufeff", html], {
    type: "application/msword",
  });
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedWordExport = { textToDocxBlob };
}
