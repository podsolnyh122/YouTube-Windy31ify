document.addEventListener('DOMContentLoaded', () => {
  const enabledToggle = document.getElementById('enabledToggle');
  const originalToggle = document.getElementById('originalToggle');

  chrome.storage.local.get({ isEnabled: true, onlyOriginal: false }, (data) => {
    enabledToggle.checked = data.isEnabled;
    originalToggle.checked = data.onlyOriginal;
  });

  enabledToggle.addEventListener('change', () => {
    chrome.storage.local.set({ isEnabled: enabledToggle.checked });
  });

  originalToggle.addEventListener('change', () => {
    chrome.storage.local.set({ onlyOriginal: originalToggle.checked });
  });
});