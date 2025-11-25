# ![Logo](extension/icon48.png) Tab Organizer

A Chrome extension that intelligently organizes your browser tabs by grouping them based on domain names and custom rules.

## Features

### Core Functionality
- **Manual Tab Organization**: Click a button to instantly organize all open tabs into groups by domain
- **Automatic Organization**: Enable auto-grouping to automatically organize tabs as you open them
- **Custom Rules**: Create your own grouping rules with regex or wildcard patterns
- **Smart Grouping**: Groups tabs by subdomain for better organization
- **Window-Aware Organization**: Choose to keep groups within their current window or organize across all windows
- **State Preservation**: Group states (expanded/collapsed) are preserved when reorganizing tabs

### Customization
- **Custom Rules Management**: Define custom grouping rules with pattern matching
- **Pattern Types**: Support for both regex and wildcard patterns (e.g., `*.google.com`)
- **Rule Priority**: Custom rules are applied before built-in rules
- **Built-in Rules Toggle**: Enable or disable default grouping rules
- **Dynamic Rules**: Fetches built-in rules from a server, allowing updates without extension modifications

### User Experience
- **Dedicated Configuration Page**: Comprehensive settings and custom rules management
- **Clean Interface**: Simple, intuitive popup with quick actions
- **Persistent Settings**: Your preferences are saved and persist across browser sessions
- **Rules Cache**: Built-in rules are cached for 24 hours to minimize server requests

## Installation

### From Chrome Web Store
Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/tab-organizer/jiikhdhajknmhcbcoihcoafckkfefmmb).

### From Source

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` directory

## Usage

### Quick Actions (Popup)

1. Click the Tab Organizer extension icon
2. Click "Organize Tabs Now" to group all tabs
3. Click "Settings" to open the configuration page

### Configuration Page

Access via the Settings link in the popup or right-click the extension icon → Options.

**Custom Rules Section:**
- Add custom grouping rules with a group name and URL patterns
- Choose between regex or wildcard pattern matching
- Enable/disable individual rules
- Edit or delete existing rules

**Settings Section:**
- **Organize New Tabs Automatically**: Auto-group tabs as you open them
- **Keep Groups in Same Window**: Prevent tabs from moving across windows
- **Use Built-in Rules**: Enable/disable default grouping rules

**Built-in Rules Viewer:**
- View all default grouping rules from the server
- See common subdomains, TLDs, search engines, and Google services

### Pattern Matching

**Wildcard Patterns:**
- Use `*` as a wildcard
- Example: `*.google.com` matches all Google subdomains
- Example: `github.com/*` matches all GitHub URLs

**Regex Patterns:**
- Full regex support
- Example: `^https://.*\.wikipedia\.org.*` matches all Wikipedia sites
- Example: `(docs|drive|mail)\.google\.com` matches specific Google services

## How It Works

### Grouping Logic
1. Custom rules are checked first (if enabled)
2. Built-in rules are applied next (if enabled and no custom match)
3. Tabs are grouped by subdomain
4. Each group gets a color based on the domain name
5. Group states (expanded/collapsed) are preserved

### Special Handling
- Chrome internal URLs (chrome://, about:) are skipped
- Invalid or blank URLs are ignored
- When "Keep Groups in Same Window" is enabled, tabs stay in their current window

### Rules Management
- Built-in rules are fetched from a server
- Rules are cached for 24 hours
- Falls back to default rules if server is unreachable
- Custom rules are stored locally in Chrome sync storage

## Built-in Rules API (Server Side)

The extension fetches built-in grouping rules from an optional server. See [server/README.md](server/README.md) for:
- Server setup and deployment instructions
- Cloudflare Workers deployment (recommended)
- Node.js server setup (local development)
- Rules configuration

## Permissions

- **tabs**: Access and organize browser tabs
- **tabGroups**: Create and manage tab groups
- **storage**: Save preferences, custom rules, and cache built-in rules
- **host_permissions**: Fetch grouping rules from the server

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers with Manifest V3 support

## Files Structure

### Extension Files (`extension/`)
- `manifest.json` - Extension configuration
- `popup.html` - Quick actions popup
- `popup.js` - Popup logic
- `options.html` - Configuration page
- `options.js` - Settings and custom rules management
- `background.js` - Service worker for tab management and grouping logic
- `utils.js` - Utility functions
- `constants.js` - Constants and default rules
- `api_client.js` - Server API communication
- `chrome_groups.js` - Tab group operations

## License

Apache License 2.0
