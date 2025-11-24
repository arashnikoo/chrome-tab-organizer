#  ![Logo](icon48.png) [Tab Organizer](https://chromewebstore.google.com/detail/tab-organizer/jiikhdhajknmhcbcoihcoafckkfefmmb)

A Chrome extension that intelligently (without AI) organizes your browser tabs by grouping them based on their domain names.

## Features

- **Manual Tab Organization**: Click a button to instantly organize all open tabs into groups by domain
- **Automatic Organization**: Enable auto-grouping to automatically organize tabs as you open them
- **Smart Grouping**: Groups tabs by subdomain for better organization
- **Window-Aware Organization**: Choose to keep groups within their current window or organize across all windows
- **State Preservation**: Group states (expanded/collapsed) are preserved when reorganizing tabs
- **Dynamic Rules**: Fetches grouping rules from a server, allowing updates without extension modifications
- **Clean Interface**: Simple, intuitive popup interface
- **Persistent Settings**: Your preferences are saved and persist across browser sessions

## Installation
### From Google Chrome Web  Store
Simply install the packaged, tested, and verified extension from the [official Chrome Web Store](https://chromewebstore.google.com/detail/tab-organizer/jiikhdhajknmhcbcoihcoafckkfefmmb).

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right corner
4. Click "Load unpacked" button
5. Select the `chrome-tab-organizer` directory

## Usage

### Manual Organization

1. Click the Tab Organizer extension icon in your Chrome toolbar
2. Click the "Organize Tabs Now" button
3. All your tabs will be automatically grouped by domain

### Automatic Organization

1. Click the Tab Organizer extension icon
2. Toggle the "Organize New Tabs Automatically" checkbox
3. New tabs will be automatically organized as you open them (with a 1.5-second debounce)

### Keep Groups in Same Window

1. Click the Tab Organizer extension icon
2. Toggle the "Keep Groups in Same Window" checkbox
3. When enabled (default): Tabs are organized into groups within their current window only
4. When disabled: Tabs from all windows are organized together, potentially moving tabs across windows

## How It Works

The extension groups tabs based on their subdomain:
- Tabs from the same subdomain are grouped together
- Each group is assigned a color based on the domain name
- When "Keep Groups in Same Window" is enabled, tabs are only grouped with other tabs in the same window
- Group states (expanded/collapsed) are remembered and preserved when reorganizing
- Grouping rules (common subdomains, TLDs, search engines, Google services) are fetched from a server
- Rules are cached for 24 hours to minimize server requests
- Falls back to default rules if server is unreachable
- Special URLs (chrome://, about:, etc.) are skipped
- Invalid or blank URLs are ignored

## Server-Side Rules

The extension can fetch grouping rules from a server, allowing you to update rules without modifying the extension code.

### Running the Rules Server

1. Navigate to the `server` directory
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. The server will run on port 3000 by default

See [server/README.md](server/README.md) for detailed server setup and deployment instructions.

### Customizing Rules

Edit `server/rules.json` to customize:
- Common subdomains to ignore (www, app, etc.)
- Common TLDs (com, org, etc.)
- Search engine domains
- Google services and their grouping logic
- URL patterns to skip

The extension automatically fetches updated rules every 24 hours, or you can manually refresh using the "Refresh Grouping Rules" button in the popup.

## Permissions

This extension requires the following permissions:
- **tabs**: To access and organize your browser tabs
- **tabGroups**: To create and manage tab groups
- **storage**: To save your preferences and cache grouping rules
- **host_permissions**: To fetch grouping rules from the server (localhost:3000 and *.vercel.app)

## Files

### Extension Files (src/)
- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Popup interaction logic
- `background.js` - Background service worker for tab management
- `utils.js` - Utility functions for tab grouping

### Server Files (server/)
- `server.js` - Express.js server for serving grouping rules
- `rules.json` - Configurable grouping rules
- `package.json` - Server dependencies

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers that support Manifest V3

## Version

Current version: 1.1

### Changelog

**v1.2** (Upcoming)
- Added server-side rules configuration
- Rules are now fetched dynamically from a server
- Added rules caching mechanism (24-hour cache)
- Added "Refresh Grouping Rules" button to manually update rules
- Expanded Google services support (Gmail, Calendar, Meet)
- Fallback to default rules when server is unavailable

**v1.1**
- Added "Keep Groups in Same Window" option to prevent tabs from moving across windows
- Groups now preserve their expanded/collapsed state when reorganizing
- Improved settings persistence

**v1.0**
- Initial release
- Manual and automatic tab organization
- Smart domain-based grouping

## License

This project is open source and available under Apache License 2.0.
