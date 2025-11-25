# Deploying to Cloudflare Workers

This guide explains how to deploy the Tab Organizer Rules API to Cloudflare Workers.

## Architecture

The server uses:
- **`worker.js`**: Cloudflare Workers entry point (imports shared handler)
- **`request-handler.js`**: Shared request handling logic
- **`rules.json`**: Grouping rules configuration

## Prerequisites

1. A Cloudflare account (free tier works fine)
2. Node.js installed on your machine

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

### 3. Deploy the Worker

From the `server` directory:

```bash
wrangler deploy
```

The deployment will output a URL like: `https://tab-organizer-api.[your-subdomain].workers.dev`

### 4. Update Extension

Update the `RULES_SERVER_URL` in `src/background.js`:

```javascript
const RULES_SERVER_URL = 'https://tab-organizer-api.[your-subdomain].workers.dev/api/rules';
```

Also update `host_permissions` in `src/manifest.json`:

```json
"host_permissions": [
  "https://tab-organizer-api.workers.dev/*"
]
```

### 5. Test the Deployment

Visit your worker URL:
- `https://tab-organizer-api.[your-subdomain].workers.dev/` - Info page
- `https://tab-organizer-api.[your-subdomain].workers.dev/api/rules` - Get rules
- `https://tab-organizer-api.[your-subdomain].workers.dev/health` - Health check

## Updating Rules

### Edit and Redeploy

1. Edit `rules.json`
2. Run `wrangler deploy`
3. Click "Refresh Grouping Rules" in the extension