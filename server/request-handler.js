// Shared request handler for both Cloudflare Workers and Node.js/Express
import RULES from './rules.json' with { type: 'json' };

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

// Handler function for processing requests
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
            version: RULES.version || '1.0.0',
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

export { handleRequest, corsHeaders };
