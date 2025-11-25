// Fetch rules from server with caching
async function fetchRules() {
    try {
        // Check if we have cached rules
        const cached = await chrome.storage.local.get([RULES_CACHE_KEY, RULES_CACHE_TIMESTAMP_KEY]);
        const now = Date.now();

        // Use cached rules if they're still valid
        if (cached[RULES_CACHE_KEY] && cached[RULES_CACHE_TIMESTAMP_KEY]) {
            const cacheAge = now - cached[RULES_CACHE_TIMESTAMP_KEY];
            if (cacheAge < RULES_CACHE_DURATION) {
                console.log('Using cached rules');
                return cached[RULES_CACHE_KEY];
            }
        }

        // Fetch fresh rules from server
        console.log('Fetching rules from server...');
        const response = await fetch(RULES_SERVER_URL);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            const rules = result.data;

            // Cache the rules
            await chrome.storage.local.set({
                [RULES_CACHE_KEY]: rules,
                [RULES_CACHE_TIMESTAMP_KEY]: now
            });

            console.log('Rules fetched and cached successfully');
            return rules;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.warn('Failed to fetch rules from server, using defaults:', error);
        return DEFAULT_RULES;
    }
}
