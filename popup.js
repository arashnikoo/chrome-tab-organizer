const toggle = document.getElementById("autoGroupToggle");

chrome.storage.sync.get(["autoGroupEnabled"], (data) => {
  toggle.checked = !!data.autoGroupEnabled;
});

toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  chrome.storage.sync.set({ autoGroupEnabled: enabled });
  chrome.runtime.sendMessage({ action: "updateAutoGroupState", enabled });
});

document.getElementById("groupTabsBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "groupTabs" });
});
