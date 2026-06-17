/**
 * File names: Adeola_Ekundayo_{Role}_resume.doc
 */
const CANDIDATE_PREFIX = "Adeola_Ekundayo";

function sanitizeRoleForFilename(role) {
  if (!role || !String(role).trim()) {
    return "Job";
  }
  return String(role)
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80) || "Job";
}

function buildDocumentFilename(role) {
  const safeRole = sanitizeRoleForFilename(role);
  return `${CANDIDATE_PREFIX}_${safeRole}_resume.doc`;
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedNaming = {
    CANDIDATE_PREFIX,
    sanitizeRoleForFilename,
    buildDocumentFilename,
  };
}
