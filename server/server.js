// Tab Organizer Rules Server
// Works with both Node.js/Express and Cloudflare Workers

import RULES from './rules.json' with { type: 'json' };

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

// Handler function for Cloudflare Workers
async function handleRequest(request) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Route: GET /api/rules
    if (url.pathname === '/api/rules' && request.method === 'GET') {
        return new Response(JSON.stringify({
            success: true,
            data: RULES
        }), {
            headers: corsHeaders
        });
    }

    // Route: GET /health
    if (url.pathname === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString()
        }), {
            headers: corsHeaders
        });
    }

    // Route: GET / (root)
    if (url.pathname === '/' && request.method === 'GET') {
        return new Response(JSON.stringify({
            name: 'Tab Organizer Rules API',
            version: RULES.version,
            endpoints: {
                '/api/rules': 'Get grouping rules',
                '/health': 'Health check'
            }
        }), {
            headers: corsHeaders
        });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({
        success: false,
        error: 'Not found'
    }), {
        status: 404,
        headers: corsHeaders
    });
}

// Cloudflare Workers export
export default {
    fetch: handleRequest
};

// Node.js/Express server (only runs in Node.js environment)
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const express = (await import('express')).default;
    const cors = (await import('cors')).default;

    const app = express();
    const PORT = process.env.PORT || 3000;

    // Enable CORS for all origins
    app.use(cors());

    // Serve static files
    app.use(express.static('public'));

    // API endpoint to get grouping rules
    app.get('/api/rules', (req, res) => {
        try {
            res.json({
                success: true,
                data: RULES
            });
        } catch (error) {
            console.error('Error reading rules:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load rules'
            });
        }
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            name: 'Tab Organizer Rules API',
            version: RULES.version,
            endpoints: {
                '/api/rules': 'Get grouping rules',
                '/health': 'Health check'
            }
        });
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Tab Organizer Rules Server running on port ${PORT}`);
        console.log(`Rules API available at: http://localhost:${PORT}/api/rules`);
    });
}



