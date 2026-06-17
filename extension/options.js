const useOpenAI = document.getElementById("useOpenAI");
const openaiApiKey = document.getElementById("openaiApiKey");
const openaiModel = document.getElementById("openaiModel");
const status = document.getElementById("status");

chrome.storage.sync.get(
  { openaiApiKey: "", openaiModel: "gpt-4o-mini", useOpenAI: false },
  (data) => {
    useOpenAI.checked = data.useOpenAI;
    openaiApiKey.value = data.openaiApiKey;
    openaiModel.value = data.openaiModel;
  }
);

document.getElementById("save").addEventListener("click", () => {
  chrome.storage.sync.set(
    {
      useOpenAI: useOpenAI.checked,
      openaiApiKey: openaiApiKey.value.trim(),
      openaiModel: openaiModel.value.trim() || "gpt-4o-mini",
    },
    () => {
      status.textContent = "Saved.";
    }
  );
});
