/**
 * File names: Adeola_Ekundayo_{Role}_resume | _cover_letter
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

function buildDocumentFilename(role, kind) {
  const safeRole = sanitizeRoleForFilename(role);
  const suffix = kind === "cover_letter" ? "cover_letter" : "resume";
  return `${CANDIDATE_PREFIX}_${safeRole}_${suffix}.doc`;
}

if (typeof globalThis !== "undefined") {
  globalThis.IndeedNaming = {
    CANDIDATE_PREFIX,
    sanitizeRoleForFilename,
    buildDocumentFilename,
  };
}
