// Tab Organizer Rules Server - Cloudflare Workers Only
// This file is specifically for Cloudflare Workers deployment

import { handleRequest } from './request-handler.js';

// Cloudflare Workers export
export default {
    fetch: handleRequest
};
