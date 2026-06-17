/**
 * PDF export matching resume layout: bold name, bold section headers, bullets.
 */

const RESUME_NAME = "ADEOLA EKUNDAYO";
const HEADER_LINE_COUNT = 5;
const LINE_HEIGHT = 13;

const RESUME_SECTION_TITLES = new Set([
  "Professional Summary",
  "Technical Skills",
  "Projects",
  "Education & Training",
  "Work Experience",
  "Developer Mindset",
]);

function isSectionHeader(line) {
  const t = line.trim();
  return RESUME_SECTION_TITLES.has(t);
}

function isSubheader(line) {
  const t = line.trim();
  if (!t || t.startsWith("•")) return false;
  if (isSectionHeader(t)) return false;
  if (t === RESUME_NAME) return false;
  if (t.includes("@") || t.includes("linkedin.com") || t.includes("github.com") || t.includes("980-358")) {
    return false;
  }
  return / — | \| Completed | — Completed/.test(t) || /\.(com|app|netlify)/i.test(t);
}

function textToPdfBlob(text, title, options = {}) {
  const lib = globalThis.jspdf || globalThis.jsPDF;
  if (!lib || !lib.jsPDF) {
    throw new Error("PDF library not loaded");
  }

  const isResume = options.isResume !== false && title === "Resume";
  const doc = new lib.jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const bodySize = 10;
  const headerSize = 11;
  const nameSize = 16;
  let y = margin;
  let lastWasSectionContent = false;

  doc.setProperties({
    title: title || "Document",
    creator: "Indeed Job Assistant",
  });

  function newPageIfNeeded(extra = LINE_HEIGHT) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function writeLines(lines, fontSize, fontStyle, extraAfter = 0) {
    doc.setFont("helvetica", fontStyle || "normal");
    doc.setFontSize(fontSize);
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line, maxWidth);
      for (const w of wrapped) {
        newPageIfNeeded();
        doc.text(w, margin, y);
        y += fontSize + 3;
      }
    }
    y += extraAfter;
  }

  const rawLines = String(text || "").split("\n");
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (isResume && trimmed === RESUME_NAME && i === 0) {
      writeLines([trimmed], nameSize, "bold");
      lastWasSectionContent = false;
      i += 1;
      continue;
    }

    if (isResume && isSectionHeader(trimmed)) {
      if (lastWasSectionContent) {
        y += LINE_HEIGHT;
      }
      writeLines([trimmed.toUpperCase()], headerSize, "bold");
      lastWasSectionContent = false;
      i += 1;
      continue;
    }

    if (isResume && isSubheader(trimmed)) {
      writeLines([trimmed], bodySize, "bold");
      lastWasSectionContent = true;
      i += 1;
      continue;
    }

    if (trimmed.startsWith("•")) {
      writeLines([trimmed], bodySize, "normal");
      lastWasSectionContent = true;
      i += 1;
      continue;
    }

    if (isResume && i < HEADER_LINE_COUNT && (trimmed.includes("|") || /LinkedIn:|GitHub:|Portfolio:/i.test(trimmed))) {
      writeLines([trimmed], bodySize, "normal");
      lastWasSectionContent = false;
      i += 1;
      continue;
    }

    const para = [trimmed];
    i += 1;
    while (
      i < rawLines.length &&
      rawLines[i].trim() &&
      !isSectionHeader(rawLines[i].trim()) &&
      !isSubheader(rawLines[i].trim()) &&
      !rawLines[i].trim().startsWith("•")
    ) {
      para.push(rawLines[i].trim());
      i += 1;
    }
    writeLines([para.join(" ")], bodySize, "normal");
    lastWasSectionContent = true;
  }

  return doc.output("blob");
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedPdfExport = { textToPdfBlob };
}
