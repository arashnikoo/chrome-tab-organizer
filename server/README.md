# Tab Organizer Rules Server

A unified server implementation that works with both Node.js and Cloudflare Workers.

## Architecture

The server uses a shared request handler (`request-handler.js`) with two entry points:
- **`worker.js`**: Cloudflare Workers deployment
- **`server.js`**: Node.js HTTP server (no dependencies)

## Deployment Options

### 1. Cloudflare Workers (Recommended) ⚡

**Best for**: Production use, global edge deployment, free hosting

See [CLOUDFLARE.md](CLOUDFLARE.md) for detailed instructions.

Quick start:
```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

**Pros**: Free, fast, global CDN, zero cold starts, 100k requests/day free tier

### 2. Node.js Server

**Best for**: Local development, custom hosting, self-hosting

No external dependencies required - uses Node.js built-in `http` module.

## Node.js Server Setup

1. No dependencies needed (optional: install `nodemon` for dev mode):
```bash
npm install  # Only needed if you want nodemon for development
```

2. Start the server:
```bash
node server.js
```

For development with auto-reload (requires nodemon):
```bash
npm run dev
```

The server will run on port 3000 by default (configurable via PORT environment variable).

## API Endpoints

### GET /api/rules
Returns the current grouping rules in JSON format.

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "lastUpdated": "2025-11-22",
    "commonSubdomains": [...],
    "commonTLDs": [...],
    "searchEngines": {...},
    "googleServices": [...],
    "skipPatterns": [...]
  }
}
```

### GET /health
Health check endpoint.

## Configuration

Edit `rules.json` to add or modify grouping rules. The extension will fetch the updated rules automatically.

## Deployment

### Cloudflare Workers (Recommended)

See [CLOUDFLARE.md](CLOUDFLARE.md) for complete instructions.

### Other Platforms

The Node.js server has zero dependencies and uses only Node.js built-ins, making it easy to deploy anywhere:
- Works with any Node.js hosting platform
- No database or external services required
- Lightweight and fast

#### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Update the extension's `RULES_SERVER_URL` with your deployment URL

## Files

- **`request-handler.js`**: Shared request handling logic (routes, CORS, responses)
- **`worker.js`**: Cloudflare Workers entry point
- **`server.js`**: Node.js HTTP server entry point
- **`rules.json`**: Grouping rules configuration
