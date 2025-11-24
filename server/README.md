# Tab Organizer Rules Server

A unified server implementation that works with both Node.js/Express and Cloudflare Workers.

## Single File, Dual Platform

The `server.js` file automatically detects its environment and runs accordingly:
- **Node.js**: Runs as an Express server
- **Cloudflare Workers**: Runs as an edge worker

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

### 2. Node.js/Express Server

**Best for**: Local development, custom hosting, self-hosting

## Node.js Server Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
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

For production deployment of the Express.js server, consider:
- Using a process manager like PM2
- Setting up proper CORS restrictions
- Using HTTPS
- Hosting on a reliable platform

#### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Update the extension's `RULES_SERVER_URL` with your deployment URL
