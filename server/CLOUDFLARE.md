# Deploying to Cloudflare Workers

This guide explains how to deploy the Tab Organizer Rules API to Cloudflare Workers.

## Single File Deployment

The `server.js` file is designed to work in both Node.js and Cloudflare Workers environments. When deployed to Cloudflare Workers, it automatically uses the Worker runtime without any code changes.

## Why Cloudflare Workers?

- **Free Tier**: 100,000 requests per day on the free plan
- **Global CDN**: Rules served from edge locations worldwide
- **Zero Cold Starts**: Instant responses
- **Easy Deployment**: Simple CLI-based deployment
- **HTTPS by Default**: Secure out of the box

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

The deployment will output a URL like: `https://tab-organizer-rules.your-subdomain.workers.dev`

### 4. Update Extension

Update the `RULES_SERVER_URL` in `src/background.js`:

```javascript
const RULES_SERVER_URL = 'https://tab-organizer-rules.your-subdomain.workers.dev/api/rules';
```

Also update `host_permissions` in `src/manifest.json`:

```json
"host_permissions": [
  "https://*.workers.dev/*"
]
```

### 5. Test the Deployment

Visit your worker URL:
- `https://your-worker.workers.dev/` - Info page
- `https://your-worker.workers.dev/api/rules` - Get rules
- `https://your-worker.workers.dev/health` - Health check

## Updating Rules

### Method 1: Edit and Redeploy (Simple)

1. Edit the `RULES` object in `worker.js`
2. Run `wrangler deploy`
3. Click "Refresh Grouping Rules" in the extension

### Method 2: Use KV Storage (Advanced)

For dynamic updates without redeployment:

1. Create a KV namespace:
```bash
wrangler kv:namespace create "RULES_KV"
```

2. Update `wrangler.toml` with the namespace ID

3. Modify `worker.js` to read from KV:
```javascript
// In the fetch handler
const rules = await env.RULES_KV.get('rules', 'json') || RULES;
```

4. Update rules via Wrangler or Dashboard:
```bash
wrangler kv:key put --namespace-id=<id> "rules" "$(cat rules.json)"
```

## Custom Domain (Optional)

You can use a custom domain:

1. Add a route in Cloudflare Dashboard
2. Go to Workers & Pages → your worker → Settings → Triggers
3. Add a custom domain

## Monitoring

View analytics in Cloudflare Dashboard:
- Workers & Pages → your worker → Metrics

## Cost

Free tier includes:
- 100,000 requests/day
- More than enough for personal use

Paid tier ($5/month):
- 10 million requests/month
- Additional features

## Troubleshooting

**CORS errors?**
- The worker includes proper CORS headers
- Ensure your extension has the correct host_permissions

**Rules not updating?**
- The extension caches rules for 24 hours
- Use "Refresh Grouping Rules" button to force update
- Or clear extension storage

## Local Development

Test locally before deploying:

```bash
wrangler dev
```

This runs the worker at `http://localhost:8787`
