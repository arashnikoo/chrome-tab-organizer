importScripts("utils.js");
importScripts("constants.js");
importScripts("api_client.js");
importScripts("chrome_groups.js");

let autoGroupEnabled = false;
let keepInSameWindow = true; // Default to keeping tabs in same window
let sortGroupsAlphabetically = false; // Default to not sorting groups
let useBuiltInRules = true; // Default to using built-in rules
let customRules = []; // User-defined custom rules
let debounceTimeout = null;

// Cached rules
let cachedRules = null;

// Initialize rules on startup
fetchRules().then(rules => {
  cachedRules = rules;
});

// Load settings on startup
chrome.storage.sync.get([
  "autoGroupEnabled",
  "keepInSameWindow",
  "sortGroupsAlphabetically",
  USE_BUILT_IN_RULES_KEY,
  CUSTOM_RULES_KEY
], (data) => {
  autoGroupEnabled = !!data.autoGroupEnabled;
  keepInSameWindow = data.keepInSameWindow !== undefined ? data.keepInSameWindow : true;
  sortGroupsAlphabetically = data.sortGroupsAlphabetically !== undefined ? data.sortGroupsAlphabetically : false;
  useBuiltInRules = data[USE_BUILT_IN_RULES_KEY] !== undefined ? data[USE_BUILT_IN_RULES_KEY] : true;
  customRules = data[CUSTOM_RULES_KEY] || [];
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "groupTabs") {
    groupTabsBySubdomain();
  } else if (message.action === "updateAutoGroupState") {
    autoGroupEnabled = message.enabled;
  } else if (message.action === "updateKeepInSameWindow") {
    keepInSameWindow = message.enabled;
  } else if (message.action === "updateSortGroupsAlphabetically") {
    sortGroupsAlphabetically = message.enabled;
  } else if (message.action === "updateUseBuiltInRules") {
    useBuiltInRules = message.enabled;
  } else if (message.action === "customRulesUpdated") {
    // Reload custom rules when updated
    chrome.storage.sync.get([CUSTOM_RULES_KEY], (data) => {
      customRules = data[CUSTOM_RULES_KEY] || [];
    });
  } else if (message.action === "getBuiltInRules") {
    // Send built-in rules to options page
    sendResponse({ rules: DEFAULT_RULES });
    return true;
  } else if (message.action === "refreshRules") {
    // Force refresh rules from server
    chrome.storage.local.remove([RULES_CACHE_KEY, RULES_CACHE_TIMESTAMP_KEY]);
    fetchRules().then(rules => {
      cachedRules = rules;
    });
  }
});

// Auto regroup when a new tab is created
chrome.tabs.onCreated.addListener(() => {
  if (!autoGroupEnabled) return;
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => groupTabsBySubdomain(true), 1500);
});

async function groupTabsBySubdomain(auto = false) {
  // Ensure we have rules loaded
  if (!cachedRules) {
    cachedRules = await fetchRules();
  }

  const rules = cachedRules || DEFAULT_RULES;
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

  // Organize tabs: structure is windowGroups[windowId][groupName] = [tabIds]
  // If keepInSameWindow is false, we use a single pseudo-window 'all'
  const windowGroups = {};

  for (const tab of tabs) {
    try {
      // Check if URL should be skipped using rules
      if (!tab.url || !tab.url.startsWith('http')) {
        continue;
      }

      let shouldSkip = false;
      shouldSkip = rules.skipPatterns.some(pattern =>
        tab.url === pattern || tab.url.startsWith(pattern)
      );

      if (shouldSkip) {
        continue;
      }

      const url = new URL(tab.url);
      const hostname = url.hostname;

      // Skip if hostname is empty or invalid
      if (!hostname || hostname.length === 0) {
        continue;
      }

      let groupName = "";

      // First, check custom rules
      const customMatch = matchCustomRule(tab.url);
      if (customMatch) {
        groupName = customMatch;
      } else if (useBuiltInRules) {
        // Use built-in rules only if enabled
        groupName = applyBuiltInRules(url, hostname, rules);
      }

      // If no group name determined, skip this tab
      if (!groupName) {
        continue;
      }

      // Use actual windowId if keeping in same window, otherwise use 'all' as pseudo-window
      const windowKey = keepInSameWindow ? tab.windowId : 'all';

      if (!windowGroups[windowKey]) {
        windowGroups[windowKey] = {};
      }
      if (!windowGroups[windowKey][groupName]) {
        windowGroups[windowKey][groupName] = [];
      }
      windowGroups[windowKey][groupName].push(tab.id);
    } catch {
      // skip non-URL tabs and any other invalid URLs
      continue;
    }
  }

  // Process all groups using the unified structure
  for (const [windowKey, groups] of Object.entries(windowGroups)) {
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));

    for (const [name, tabIds] of sortedGroups) {
      if (tabIds.length === 0) continue;

      try {
        const groupOptions = keepInSameWindow
          ? { tabIds, createProperties: { windowId: parseInt(windowKey) } }
          : { tabIds };

        const groupId = await chrome.tabs.group(groupOptions);
        const collapsed = groupStates.hasOwnProperty(name) ? groupStates[name] : true;

        await chrome.tabGroups.update(groupId, {
          title: name,
          color: randomColor(),
          collapsed: collapsed
        });
      } catch (err) {
        console.warn("Failed to group:", name, keepInSameWindow ? `in window ${windowKey}` : '', err);
      }
    }
  }

  // Sort groups alphabetically if enabled
  if (sortGroupsAlphabetically) {
    await sortGroupsByName();
  }

  if (!auto) console.log("Tabs grouped by subdomain/domain and minimized.");
}

// Match custom rule against URL
function matchCustomRule(url) {
  for (const rule of customRules) {
    if (!rule.enabled) continue;

    for (const pattern of rule.patterns) {
      let isMatch = false;

      if (rule.patternType === 'regex') {
        try {
          const regex = new RegExp(pattern);
          isMatch = regex.test(url);
        } catch (e) {
          console.warn(`Invalid regex pattern: ${pattern}`, e);
          continue;
        }
      } else {
        // Wildcard matching
        isMatch = wildcardMatch(url, pattern);
      }

      if (isMatch) {
        return rule.groupName;
      }
    }
  }
  return null;
}

// Wildcard matching function
function wildcardMatch(text, pattern) {
  // Escape special regex characters except *
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  // Replace * with .*
  const regexPattern = '^' + escaped.replace(/\*/g, '.*') + '$';
  const regex = new RegExp(regexPattern, 'i');
  return regex.test(text);
}

// Apply built-in rules to determine group name
function applyBuiltInRules(url, hostname, rules) {
  const parts = hostname.split(".");
  let groupName = "";

  // Check for Google services first using rules
  let isGoogleService;
  ({ isGoogleService, groupName } = extractGroupNameForGoogleService(rules, hostname, url, groupName));

  if (isGoogleService) {
    return groupName;
  }

  // Check if this is a search engine results page using rules
  let isSearchEngine = false;
  ({ groupName, isSearchEngine } = determineSearchEngineGroup(rules, hostname, url, groupName, isSearchEngine));

  if (isSearchEngine) {
    return groupName;
  }

  // Use regular domain grouping logic
  return getDomainGrouping(parts, rules, groupName, hostname);
}

function determineSearchEngineGroup(rules, hostname, url, groupName, isSearchEngine) {
  for (const [engine, domains] of Object.entries(rules.searchEngines)) {
    if (domains.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
      // Check if it's likely a search results page (has search parameters)
      if (url.search && (url.search.includes('q=') || url.search.includes('query=') || url.search.includes('search='))) {
        groupName = engine + ' search';
        isSearchEngine = true;
        break;
      }
    }
  }
  return { groupName, isSearchEngine };
}

function getDomainGrouping(parts, rules, groupName, hostname) {
  if (parts.length > 2) {
    // Skip common subdomains and use the next part or main domain
    if (rules.commonSubdomains.includes(parts[0])) {
      groupName = parts[1]; // use the main domain part
    } else {
      groupName = parts[0]; // use the subdomain
    }
  } else {
    // For 2-part domains, check if TLD is common
    const tld = parts[parts.length - 1];
    if (rules.commonTLDs.includes(tld)) {
      groupName = parts[0]; // domain name (like "github")
    } else {
      groupName = hostname; // use full domain for uncommon TLDs
    }
  }
  return groupName;
}

function extractGroupNameForGoogleService(rules, hostname, url, groupName) {
  let isGoogleService = false;
  for (const service of rules.googleServices) {
    if (hostname === service.hostname) {
      if (service.pathRules) {
        // Check path-based rules
        for (const pathRule of service.pathRules) {
          if (url.pathname.startsWith(pathRule.pathPrefix)) {
            groupName = pathRule.groupName;
            isGoogleService = true;
            break;
          }
        }
        // Use default if no path matched
        if (!isGoogleService && service.defaultGroupName) {
          groupName = service.defaultGroupName;
          isGoogleService = true;
        }
      } else if (service.groupName) {
        groupName = service.groupName;
        isGoogleService = true;
      }
      break;
    }
  }
  return { isGoogleService, groupName };
}

