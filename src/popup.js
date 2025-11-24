const toggle = document.getElementById("autoGroupToggle");
const keepInSameWindowToggle = document.getElementById("keepInSameWindowToggle");
const sortGroupsAlphabeticallyToggle = document.getElementById("sortGroupsAlphabeticallyToggle");

chrome.storage.sync.get(["autoGroupEnabled", "keepInSameWindow", "sortGroupsAlphabetically"], (data) => {
  toggle.checked = !!data.autoGroupEnabled;
  keepInSameWindowToggle.checked = data.keepInSameWindow !== undefined ? data.keepInSameWindow : true;
  sortGroupsAlphabeticallyToggle.checked = data.sortGroupsAlphabetically !== undefined ? data.sortGroupsAlphabetically : false;
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

sortGroupsAlphabeticallyToggle.addEventListener("change", () => {
  const enabled = sortGroupsAlphabeticallyToggle.checked;
  chrome.storage.sync.set({ sortGroupsAlphabetically: enabled });
  chrome.runtime.sendMessage({ action: "updateSortGroupsAlphabetically", enabled });
});

document.getElementById("groupTabsBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "groupTabs" });
});

document.getElementById("refreshRulesBtn").addEventListener("click", () => {
  const btn = document.getElementById("refreshRulesBtn");
  btn.textContent = "Refreshing...";
  btn.disabled = true;

  chrome.runtime.sendMessage({ action: "refreshRules" });

  // Show feedback without waiting for response
  setTimeout(() => {
    btn.textContent = "Rules Refreshed!";
    setTimeout(() => {
      btn.textContent = "Refresh Grouping Rules";
      btn.disabled = false;
    }, 2000);
  }, 500);
});
