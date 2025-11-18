importScripts("utils.js");

let autoGroupEnabled = false;
let keepInSameWindow = true; // Default to keeping tabs in same window
let debounceTimeout = null;

// Load settings on startup
chrome.storage.sync.get(["autoGroupEnabled", "keepInSameWindow"], (data) => {
  autoGroupEnabled = !!data.autoGroupEnabled;
  keepInSameWindow = data.keepInSameWindow !== undefined ? data.keepInSameWindow : true;
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "groupTabs") {
    groupTabsBySubdomain();
  } else if (message.action === "updateAutoGroupState") {
    autoGroupEnabled = message.enabled;
  } else if (message.action === "updateKeepInSameWindow") {
    keepInSameWindow = message.enabled;
  }
});

// Auto regroup when a new tab is created
chrome.tabs.onCreated.addListener(() => {
  if (!autoGroupEnabled) return;
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => groupTabsBySubdomain(true), 1500);
});

async function groupTabsBySubdomain(auto = false) {
  const tabs = await chrome.tabs.query({});

  // Get all existing tab groups and their states
  const existingGroups = await chrome.tabGroups.query({});
  const groupStates = {};

  // Store the current state (collapsed/expanded) of each group by title
  for (const group of existingGroups) {
    if (group.title) {
      groupStates[group.title] = group.collapsed;
    }
  }

  // Organize tabs by window if keepInSameWindow is enabled, otherwise organize all tabs together
  const groups = keepInSameWindow ? null : {};
  const windowGroups = keepInSameWindow ? {} : null;

  for (const tab of tabs) {
    try {
      // Skip blank pages and invalid URLs
      if (!tab.url ||
        tab.url === 'about:blank' ||
        tab.url.startsWith('chrome://') ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('about:') ||
        tab.url === 'data:' ||
        !tab.url.startsWith('http')) {
        continue;
      }

      const url = new URL(tab.url);
      const hostname = url.hostname;

      // Skip if hostname is empty or invalid
      if (!hostname || hostname.length === 0) {
        continue;
      }

      const parts = hostname.split(".");

      // Common subdomains to ignore (treat like www)
      const commonSubdomains = ['www', 'app', 'api', 'm', 'mobile', 'web', 'cloud', 'mail', 'email', 'admin', 'secure', 'login', 'auth', 'account', 'my', 'portal', 'dashboard', 'admin', 'support', 'help', 'docs', 'blog', 'news', 'shop', 'store', 'cdn', 'static', 'assets'];

      // Common TLDs (Top Level Domains)
      const commonTLDs = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'me', 'tv', 'app', 'dev', 'ai'];

      // Check for popular search engines first
      let groupName = "";
      const searchEngines = {
        'google': ['google.com', 'google.co.uk', 'google.ca', 'google.pl', 'google.de', 'google.fr', 'google.it', 'google.es', 'google.com.au', 'google.co.jp'],
        'bing': ['bing.com', 'www.bing.com'],
        'yahoo': ['yahoo.com', 'search.yahoo.com', 'www.yahoo.com'],
        'duckduckgo': ['duckduckgo.com', 'www.duckduckgo.com']
      };

      // Check for Google services first
      let isGoogleService = false;
      if (hostname === 'docs.google.com') {
        // Check the URL path to distinguish between different Google services
        if (url.pathname.startsWith('/spreadsheets')) {
          groupName = 'google sheets';
        } else if (url.pathname.startsWith('/document')) {
          groupName = 'google docs';
        } else if (url.pathname.startsWith('/presentation')) {
          groupName = 'google slides';
        } else if (url.pathname.startsWith('/forms')) {
          groupName = 'google forms';
        } else {
          groupName = 'google docs'; // default for docs.google.com
        }
        isGoogleService = true;
      } else if (hostname === 'drive.google.com') {
        groupName = 'google drive';
        isGoogleService = true;
      }

      // Check if this is a search engine results page
      let isSearchEngine = false;
      if (!isGoogleService) {
        for (const [engine, domains] of Object.entries(searchEngines)) {
          if (domains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
            // Check if it's likely a search results page (has search parameters)
            if (url.search && (url.search.includes('q=') || url.search.includes('query=') || url.search.includes('search='))) {
              groupName = engine + ' search';
              isSearchEngine = true;
              break;
            }
          }
        }
      }

      // If not a search engine or Google service, use regular domain grouping logic
      if (!isSearchEngine && !isGoogleService) {
        if (parts.length > 2) {
          // Skip common subdomains and use the next part or main domain
          if (commonSubdomains.includes(parts[0])) {
            groupName = parts[1]; // use the main domain part
          } else {
            groupName = parts[0]; // use the subdomain
          }
        } else {
          // For 2-part domains, check if TLD is common
          const tld = parts[parts.length - 1];
          if (commonTLDs.includes(tld)) {
            groupName = parts[0]; // domain name (like "github")
          } else {
            groupName = hostname; // use full domain for uncommon TLDs
          }
        }
      }

      if (keepInSameWindow) {
        // Group by window ID first, then by domain within that window
        const windowId = tab.windowId;
        if (!windowGroups[windowId]) {
          windowGroups[windowId] = {};
        }
        if (!windowGroups[windowId][groupName]) {
          windowGroups[windowId][groupName] = [];
        }
        windowGroups[windowId][groupName].push(tab.id);
      } else {
        // Group all tabs together regardless of window
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(tab.id);
      }
    } catch {
      // skip non-URL tabs and any other invalid URLs
      continue;
    }
  }

  // Process groups based on keepInSameWindow setting
  if (keepInSameWindow) {
    // Process each window separately
    for (const [windowId, groups] of Object.entries(windowGroups)) {
      // Sort groups alphabetically by name and create them
      const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

      for (const [name, tabIds] of sortedGroups) {
        if (tabIds.length === 0) continue;
        try {
          // Group tabs within the specific window to prevent moving tabs across windows
          const groupId = await chrome.tabs.group({
            tabIds: tabIds,
            createProperties: {
              windowId: parseInt(windowId)
            }
          });

          // Preserve the previous collapsed state if the group existed, otherwise collapse by default
          const collapsed = groupStates.hasOwnProperty(name) ? groupStates[name] : true;

          await chrome.tabGroups.update(groupId, {
            title: name,
            color: randomColor(),
            collapsed: collapsed
          });
        } catch (err) {
          console.warn("Failed to group:", name, "in window", windowId, err);
        }
      }
    }
  } else {
    // Process all tabs together regardless of window
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

    for (const [name, tabIds] of sortedGroups) {
      if (tabIds.length === 0) continue;
      try {
        const groupId = await chrome.tabs.group({ tabIds });

        // Preserve the previous collapsed state if the group existed, otherwise collapse by default
        const collapsed = groupStates.hasOwnProperty(name) ? groupStates[name] : true;

        await chrome.tabGroups.update(groupId, {
          title: name,
          color: randomColor(),
          collapsed: collapsed
        });
      } catch (err) {
        console.warn("Failed to group:", name, err);
      }
    }
  }

  if (!auto) console.log("Tabs grouped by subdomain/domain and minimized.");
}
