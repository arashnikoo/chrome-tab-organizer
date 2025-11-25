// Tab Organizer - Options Page Script

const CUSTOM_RULES_KEY = 'customRules';
const USE_BUILT_IN_RULES_KEY = 'useBuiltInRules';

let customRules = [];
let editingRuleIndex = -1;
let selectedColor = 'blue'; // Default color

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadCustomRules();
    loadBuiltInRules();
    attachEventListeners();
});

// Load all settings
function loadSettings() {
    chrome.storage.sync.get([
        'autoGroupEnabled',
        'keepInSameWindow',
        'sortGroupsAlphabetically',
        USE_BUILT_IN_RULES_KEY
    ], (data) => {
        document.getElementById('autoGroupToggle').checked = !!data.autoGroupEnabled;
        document.getElementById('keepInSameWindowToggle').checked =
            data.keepInSameWindow !== undefined ? data.keepInSameWindow : true;
        document.getElementById('sortGroupsAlphabeticallyToggle').checked =
            data.sortGroupsAlphabetically !== undefined ? data.sortGroupsAlphabetically : false;
        document.getElementById('useBuiltInRulesToggle').checked =
            data[USE_BUILT_IN_RULES_KEY] !== undefined ? data[USE_BUILT_IN_RULES_KEY] : true;
    });
}

// Load custom rules from storage
function loadCustomRules() {
    chrome.storage.sync.get([CUSTOM_RULES_KEY], (data) => {
        customRules = data[CUSTOM_RULES_KEY] || [];
        // Ensure all rules have an order field
        customRules = customRules.map((rule, index) => ({
            ...rule,
            order: rule.order !== undefined ? rule.order : index
        }));
        renderCustomRules();
    });
}

// Render custom rules list
function renderCustomRules() {
    const container = document.getElementById('customRulesList');

    if (customRules.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"></div>
        <p>No custom rules yet. Click "Add Custom Rule" to create one.</p>
      </div>
    `;
        return;
    }

    // Sort rules by order (lower number = higher priority)
    const sortedRules = [...customRules].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
        const orderB = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });

    container.innerHTML = sortedRules.map((rule, displayIndex) => {
        const actualIndex = customRules.indexOf(rule);
        const isFirst = displayIndex === 0;
        const isLast = displayIndex === sortedRules.length - 1;

        return `
    <div class="rule-item" data-index="${actualIndex}">
      <div class="rule-order-controls">
        <button class="rule-order-btn move-up-btn" data-index="${actualIndex}" ${isFirst ? 'disabled' : ''} title="Move up (higher priority)">&#9650;</button>
        <button class="rule-order-btn move-down-btn" data-index="${actualIndex}" ${isLast ? 'disabled' : ''} title="Move down (lower priority)">&#9660;</button>
      </div>
      <div class="rule-content">
        <div class="rule-header">
          <span class="rule-name">
            ${escapeHtml(rule.groupName)}
            ${rule.color ? `<span class="rule-color-indicator" style="background-color: ${getColorHex(rule.color)};"></span>` : ''}
            <span class="rule-priority-badge">Priority ${displayIndex + 1}</span>
          </span>
          <span class="rule-type-badge">${rule.patternType === 'regex' ? 'RegEx' : 'Wildcard'}</span>
        </div>
        <div class="rule-patterns">
          ${rule.patterns.map(p => escapeHtml(p)).join('<br>')}
        </div>
        <div class="rule-actions">
          <button class="secondary small edit-rule-btn" data-index="${actualIndex}">Edit</button>
          <button class="danger small delete-rule-btn" data-index="${actualIndex}">Delete</button>
        </div>
      </div>
    </div>
  `;
    }).join('');

    // Attach event listeners to rule action buttons
    container.querySelectorAll('.edit-rule-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            editRule(index);
        });
    });

    container.querySelectorAll('.delete-rule-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteRule(index);
        });
    });

    container.querySelectorAll('.move-up-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            moveRuleUp(index);
        });
    });

    container.querySelectorAll('.move-down-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            moveRuleDown(index);
        });
    });
}

// Load and display built-in rules
async function loadBuiltInRules() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getBuiltInRules' });
        if (response && response.rules) {
            displayBuiltInRules(response.rules);
        }
    } catch (error) {
        console.error('Failed to load built-in rules:', error);
    }
}

// Display built-in rules
function displayBuiltInRules(rules) {
    // Google Services
    const googleList = document.getElementById('googleServicesList');
    googleList.innerHTML = rules.googleServices.map(service => {
        if (service.pathRules) {
            return `<li>${service.hostname}: ${service.pathRules.map(r => r.groupName).join(', ')}</li>`;
        }
        return `<li>${service.hostname} → ${service.groupName}</li>`;
    }).join('');

    // Search Engines
    const searchList = document.getElementById('searchEnginesList');
    searchList.innerHTML = Object.entries(rules.searchEngines).map(([engine, domains]) =>
        `<li>${engine}: ${domains.join(', ')}</li>`
    ).join('');

    // Common Subdomains
    const subdomainsList = document.getElementById('commonSubdomainsList');
    subdomainsList.innerHTML = `<li>${rules.commonSubdomains.join(', ')}</li>`;

    // Common TLDs
    const tldsList = document.getElementById('commonTLDsList');
    tldsList.innerHTML = `<li>${rules.commonTLDs.join(', ')}</li>`;
}

// Attach event listeners
function attachEventListeners() {
    // Settings toggles
    document.getElementById('autoGroupToggle').addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ autoGroupEnabled: enabled });
        chrome.runtime.sendMessage({ action: 'updateAutoGroupState', enabled });
        showStatus('Settings saved', 'success');
    });

    document.getElementById('keepInSameWindowToggle').addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ keepInSameWindow: enabled });
        chrome.runtime.sendMessage({ action: 'updateKeepInSameWindow', enabled });
        showStatus('Settings saved', 'success');
    });

    document.getElementById('sortGroupsAlphabeticallyToggle').addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ sortGroupsAlphabetically: enabled });
        chrome.runtime.sendMessage({ action: 'updateSortGroupsAlphabetically', enabled });
        showStatus('Settings saved', 'success');
    });

    document.getElementById('useBuiltInRulesToggle').addEventListener('change', (e) => {
        const enabled = e.target.checked;
        chrome.storage.sync.set({ [USE_BUILT_IN_RULES_KEY]: enabled });
        chrome.runtime.sendMessage({ action: 'updateUseBuiltInRules', enabled });
        showStatus('Settings saved', 'success');
    });

    // Add rule button
    document.getElementById('addRuleBtn').addEventListener('click', () => {
        showAddRuleForm();
    });

    // Pattern type change
    document.getElementById('rulePatternType').addEventListener('change', (e) => {
        const helpText = document.getElementById('patternTypeHelp');
        if (e.target.value === 'regex') {
            helpText.textContent = 'Use regular expression syntax. Example: ^https://.*\\.github\\.com/.*$';
        } else {
            helpText.textContent = 'Use * to match any characters. Example: *github.com/*';
        }
    });

    // Save rule button
    document.getElementById('saveRuleBtn').addEventListener('click', () => {
        saveRule();
    });

    // Cancel rule button
    document.getElementById('cancelRuleBtn').addEventListener('click', () => {
        hideAddRuleForm();
    });

    // Toggle built-in rules display
    document.getElementById('toggleBuiltInRulesBtn').addEventListener('click', () => {
        const display = document.getElementById('builtInRulesDisplay');
        const btn = document.getElementById('toggleBuiltInRulesBtn');
        if (display.style.display === 'none') {
            display.style.display = 'block';
            btn.textContent = 'Hide Built-in Rules';
        } else {
            display.style.display = 'none';
            btn.textContent = 'Show Built-in Rules';
        }
    });

    // Refresh rules button
    document.getElementById('refreshRulesBtn').addEventListener('click', () => {
        const btn = document.getElementById('refreshRulesBtn');
        btn.textContent = 'Refreshing...';
        btn.disabled = true;

        chrome.runtime.sendMessage({ action: 'refreshRules' });

        setTimeout(() => {
            btn.textContent = 'Refresh Server Rules';
            btn.disabled = false;
            showStatus('Rules refreshed successfully', 'success');
        }, 1500);
    });


    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedColor = e.target.dataset.color;
        });
    });
}

// Show add rule form
function showAddRuleForm() {
    editingRuleIndex = -1;
    selectedColor = 'blue';
    document.getElementById('ruleGroupName').value = '';
    document.getElementById('rulePatternType').value = 'wildcard';
    document.getElementById('rulePatterns').value = '';
    document.getElementById('patternTypeHelp').textContent = 'Use * to match any characters. Example: *github.com/*';

    // Reset color selection
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector('.color-option[data-color="blue"]').classList.add('selected');

    document.getElementById('addRuleForm').classList.add('active');
    document.getElementById('addRuleBtn').style.display = 'none';
}

// Hide add rule form
function hideAddRuleForm() {
    editingRuleIndex = -1;
    document.getElementById('addRuleForm').classList.remove('active');
    document.getElementById('addRuleBtn').style.display = 'inline-block';
}

// Save rule
function saveRule() {
    const groupName = document.getElementById('ruleGroupName').value.trim();
    const patternType = document.getElementById('rulePatternType').value;
    const patternsText = document.getElementById('rulePatterns').value.trim();

    if (!groupName) {
        showStatus('Please enter a group name', 'error');
        return;
    }

    if (!patternsText) {
        showStatus('Please enter at least one pattern', 'error');
        return;
    }

    const patterns = patternsText.split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

    if (patterns.length === 0) {
        showStatus('Please enter at least one valid pattern', 'error');
        return;
    }

    // Validate regex patterns
    if (patternType === 'regex') {
        for (const pattern of patterns) {
            try {
                new RegExp(pattern);
            } catch (e) {
                showStatus(`Invalid regex pattern: ${pattern}`, 'error');
                return;
            }
        }
    }

    const rule = {
        groupName,
        patternType,
        patterns,
        enabled: true,
        color: selectedColor
    };

    if (editingRuleIndex >= 0) {
        // Update existing rule - preserve its order
        rule.order = customRules[editingRuleIndex].order;
        customRules[editingRuleIndex] = rule;
    } else {
        // Add new rule at the end (highest order number)
        const maxOrder = customRules.length > 0
            ? Math.max(...customRules.map(r => r.order !== undefined ? r.order : 0))
            : -1;
        rule.order = maxOrder + 1;
        customRules.push(rule);
    }

    // Save to storage
    chrome.storage.sync.set({ [CUSTOM_RULES_KEY]: customRules }, () => {
        renderCustomRules();
        hideAddRuleForm();
        showStatus(editingRuleIndex >= 0 ? 'Rule updated successfully' : 'Rule added successfully', 'success');

        // Notify background script
        chrome.runtime.sendMessage({ action: 'customRulesUpdated' });
    });
}

// Edit rule
function editRule(index) {
    const rule = customRules[index];
    editingRuleIndex = index;

    document.getElementById('ruleGroupName').value = rule.groupName;
    document.getElementById('rulePatternType').value = rule.patternType;
    document.getElementById('rulePatterns').value = rule.patterns.join('\n');

    // Set selected color
    selectedColor = rule.color || 'blue';
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
    const colorOption = document.querySelector(`.color-option[data-color="${selectedColor}"]`);
    if (colorOption) {
        colorOption.classList.add('selected');
    }

    const helpText = document.getElementById('patternTypeHelp');
    if (rule.patternType === 'regex') {
        helpText.textContent = 'Use regular expression syntax. Example: ^https://.*\\.github\\.com/.*$';
    } else {
        helpText.textContent = 'Use * to match any characters. Example: *github.com/*';
    }

    document.getElementById('addRuleForm').classList.add('active');
    document.getElementById('addRuleBtn').style.display = 'none';
}

// Delete rule
function deleteRule(index) {
    if (confirm('Are you sure you want to delete this rule?')) {
        customRules.splice(index, 1);
        // Reassign order values
        customRules.forEach((rule, i) => {
            rule.order = i;
        });
        chrome.storage.sync.set({ [CUSTOM_RULES_KEY]: customRules }, () => {
            renderCustomRules();
            showStatus('Rule deleted successfully', 'success');

            // Notify background script
            chrome.runtime.sendMessage({ action: 'customRulesUpdated' });
        });
    }
}

// Move rule up (higher priority, lower order number)
function moveRuleUp(index) {
    const rule = customRules[index];
    const currentOrder = rule.order !== undefined ? rule.order : index;

    // Find the rule with the next lower order value
    const sortedRules = [...customRules].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
        const orderB = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });

    const currentDisplayIndex = sortedRules.indexOf(rule);
    if (currentDisplayIndex === 0) return; // Already at top

    const swapRule = sortedRules[currentDisplayIndex - 1];
    const swapOrder = swapRule.order !== undefined ? swapRule.order : customRules.indexOf(swapRule);

    // Swap orders
    rule.order = swapOrder;
    swapRule.order = currentOrder;

    saveRulesOrder();
}

// Move rule down (lower priority, higher order number)
function moveRuleDown(index) {
    const rule = customRules[index];
    const currentOrder = rule.order !== undefined ? rule.order : index;

    // Find the rule with the next higher order value
    const sortedRules = [...customRules].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
        const orderB = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
    });

    const currentDisplayIndex = sortedRules.indexOf(rule);
    if (currentDisplayIndex === sortedRules.length - 1) return; // Already at bottom

    const swapRule = sortedRules[currentDisplayIndex + 1];
    const swapOrder = swapRule.order !== undefined ? swapRule.order : customRules.indexOf(swapRule);

    // Swap orders
    rule.order = swapOrder;
    swapRule.order = currentOrder;

    saveRulesOrder();
}

// Save rules order to storage
function saveRulesOrder() {
    chrome.storage.sync.set({ [CUSTOM_RULES_KEY]: customRules }, () => {
        renderCustomRules();
        showStatus('Rule order updated', 'success');

        // Notify background script
        chrome.runtime.sendMessage({ action: 'customRulesUpdated' });
    });
}

// Show status message
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type} active`;

    setTimeout(() => {
        statusEl.classList.remove('active');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get hex color from Chrome color name
function getColorHex(colorName) {
    const colorMap = {
        'grey': '#5f6368',
        'blue': '#1a73e8',
        'red': '#d93025',
        'yellow': '#f9ab00',
        'green': '#188038',
        'pink': '#d01884',
        'purple': '#9334e6',
        'cyan': '#007b83',
        'orange': '#e8710a'
    };
    return colorMap[colorName] || colorMap['blue'];
}
