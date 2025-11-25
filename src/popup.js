// Simple popup - just quick actions
document.getElementById("groupTabsBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "groupTabs" });
  window.close();
});

document.getElementById("openOptionsLink").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
