# Chrome Tab Organizer

A Chrome extension that intelligently organizes your browser tabs by grouping them based on their domain names.

## Features

- **Manual Tab Organization**: Click a button to instantly organize all open tabs into groups by domain
- **Automatic Organization**: Enable auto-grouping to automatically organize tabs as you open them
- **Smart Grouping**: Groups tabs by subdomain for better organization
- **Window-Aware Organization**: Choose to keep groups within their current window or organize across all windows
- **State Preservation**: Group states (expanded/collapsed) are preserved when reorganizing tabs
- **Clean Interface**: Simple, intuitive popup interface
- **Persistent Settings**: Your preferences are saved and persist across browser sessions

## Installation

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
- Special URLs (chrome://, about:, etc.) are skipped
- Invalid or blank URLs are ignored

## Permissions

This extension requires the following permissions:
- **tabs**: To access and organize your browser tabs
- **tabGroups**: To create and manage tab groups
- **storage**: To save your auto-grouping preference

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Popup interaction logic
- `background.js` - Background service worker for tab management
- `utils.js` - Utility functions for tab grouping

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers that support Manifest V3

## Version

Current version: 1.1

### Changelog

**v1.1**
- Added "Keep Groups in Same Window" option to prevent tabs from moving across windows
- Groups now preserve their expanded/collapsed state when reorganizing
- Improved settings persistence

**v1.0**
- Initial release
- Manual and automatic tab organization
- Smart domain-based grouping

## License

This project is open source and available under standard licensing terms.
