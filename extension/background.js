/**
 * Service worker: save generated documents as Microsoft Word (.docx) files.
 */
importScripts("lib/word-export.js");

const CANDIDATE_PREFIX = "Adeola_Ekundayo";

function sanitizeRoleForFilename(role) {
  if (!role || !String(role).trim()) return "Job";
  return (
    String(role)
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 80) || "Job"
  );
}

function buildDocumentFilename(role, kind) {
  const safeRole = sanitizeRoleForFilename(role);
  const suffix = kind === "cover_letter" ? "cover_letter" : "resume";
  return `${CANDIDATE_PREFIX}_${safeRole}_${suffix}.doc`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Failed to read document"));
    reader.readAsDataURL(blob);
  });
}

async function downloadWord(filename, text, title) {
  const blob = await IndeedWordExport.textToDocxBlob(text, title);
  const dataUrl = await blobToDataUrl(blob);
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: dataUrl,
        filename,
        saveAs: true,
        conflictAction: "uniquify",
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(downloadId);
        }
      }
    );
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SAVE_DOCUMENT") {
    const filename = buildDocumentFilename(message.role, message.kind);
    const title = message.kind === "cover_letter" ? "Cover Letter" : "Resume";
    downloadWord(filename, message.content, title)
      .then((downloadId) => sendResponse({ ok: true, filename, downloadId }))
      .catch((e) => sendResponse({ error: e.message }));
    return true;
  }

  if (message.type === "SAVE_BOTH") {
    const resumeName = buildDocumentFilename(message.role, "resume");
    const coverName = buildDocumentFilename(message.role, "cover_letter");
    downloadWord(resumeName, message.resume, "Resume")
      .then(() => downloadWord(coverName, message.coverLetter, "Cover Letter"))
      .then((coverId) => sendResponse({ ok: true, files: [resumeName, coverName] }))
      .catch((e) => sendResponse({ error: e.message }));
    return true;
  }
});
