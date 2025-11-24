// Default fallback rules (in case server is unreachable)
const DEFAULT_RULES = {
    commonSubdomains: ['www', 'app', 'api', 'm', 'mobile', 'web', 'cloud', 'mail', 'email', 'admin', 'secure', 'login', 'auth', 'account', 'my', 'portal', 'dashboard', 'dash', 'support', 'help', 'docs', 'blog', 'news', 'shop', 'store', 'cdn', 'static', 'assets'],
    commonTLDs: ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'me', 'tv', 'app', 'dev', 'ai'],
    searchEngines: {
        'google': ['google.com', 'google.co.uk', 'google.ca', 'google.pl', 'google.de', 'google.fr', 'google.it', 'google.es', 'google.com.au', 'google.co.jp'],
        'bing': ['bing.com', 'www.bing.com'],
        'yahoo': ['yahoo.com', 'search.yahoo.com', 'www.yahoo.com'],
        'duckduckgo': ['duckduckgo.com', 'www.duckduckgo.com']
    },
    googleServices: [
        {
            hostname: 'docs.google.com',
            pathRules: [
                { pathPrefix: '/spreadsheets', groupName: 'google sheets' },
                { pathPrefix: '/document', groupName: 'google docs' },
                { pathPrefix: '/presentation', groupName: 'google slides' },
                { pathPrefix: '/forms', groupName: 'google forms' }
            ],
            defaultGroupName: 'google docs'
        },
        { hostname: 'drive.google.com', groupName: 'google drive' }
    ],
    skipPatterns: ['about:blank', 'chrome://', 'chrome-extension://', 'about:', 'data:']
};

// Rules server configuration
const RULES_SERVER_URL = 'http://localhost:3000/api/rules'; // Change to your deployed server URL
const RULES_CACHE_KEY = 'groupingRules';
const RULES_CACHE_TIMESTAMP_KEY = 'groupingRulesTimestamp';
const RULES_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
