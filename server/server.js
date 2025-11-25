// Tab Organizer Rules Server - Node.js
// Uses the same handleRequest logic as worker.js

import { createServer } from 'http';
import { handleRequest } from './request-handler.js';

const PORT = process.env.PORT || 3000;

const server = createServer(async (nodeReq, nodeRes) => {
    // Convert Node.js request to Web API Request
    const url = `http://${nodeReq.headers.host}${nodeReq.url}`;

    // Collect body data if present
    let body = null;
    if (nodeReq.method !== 'GET' && nodeReq.method !== 'HEAD') {
        const chunks = [];
        for await (const chunk of nodeReq) {
            chunks.push(chunk);
        }
        body = Buffer.concat(chunks);
    }

    const request = new Request(url, {
        method: nodeReq.method,
        headers: nodeReq.headers,
        body: body
    });

    // Use the shared handleRequest function
    const response = await handleRequest(request);

    // Convert Web API Response to Node.js response
    nodeRes.statusCode = response.status;
    response.headers.forEach((value, key) => {
        nodeRes.setHeader(key, value);
    });

    const responseBody = await response.text();
    nodeRes.end(responseBody);
});

server.listen(PORT, () => {
    console.log(`Tab Organizer Rules Server running on port ${PORT}`);
    console.log(`Rules API available at: http://localhost:${PORT}/api/rules`);
});



