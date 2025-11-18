const toggle = document.getElementById("autoGroupToggle");
const keepInSameWindowToggle = document.getElementById("keepInSameWindowToggle");

chrome.storage.sync.get(["autoGroupEnabled", "keepInSameWindow"], (data) => {
  toggle.checked = !!data.autoGroupEnabled;
  keepInSameWindowToggle.checked = data.keepInSameWindow !== undefined ? data.keepInSameWindow : true;
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ autoGroupEnabled: enabled });
  chrome.runtime.sendMessage({ action: "updateAutoGroupState", enabled });
});

keepInSameWindowToggle.addEventListener("change", () => {
  const enabled = keepInSameWindowToggle.checked;
  chrome.storage.sync.set({ keepInSameWindow: enabled });
  chrome.runtime.sendMessage({ action: "updateKeepInSameWindow", enabled });
});

document.getElementById("groupTabsBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "groupTabs" });
});
