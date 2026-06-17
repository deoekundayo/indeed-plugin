/**
 * Service worker: save generated resumes as Microsoft Word (.doc) files.
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

function buildDocumentFilename(role) {
  const safeRole = sanitizeRoleForFilename(role);
  return `${CANDIDATE_PREFIX}_${safeRole}_resume.doc`;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("Failed to read document"));
    reader.readAsDataURL(blob);
  });
}

async function downloadWord(filename, text) {
  const blob = await IndeedWordExport.textToDocxBlob(text, "Resume");
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
    const filename = buildDocumentFilename(message.role);
    downloadWord(filename, message.content)
      .then((downloadId) => sendResponse({ ok: true, filename, downloadId }))
      .catch((e) => sendResponse({ error: e.message }));
    return true;
  }
});
