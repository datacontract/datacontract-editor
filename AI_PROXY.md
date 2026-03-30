# AI Proxy Setup

The Data Contract Editor runs entirely in the browser. AI requests are made directly from the browser to the configured endpoint using `fetch()`. This means CORS restrictions apply — the AI endpoint must allow requests from the browser's origin.

**When do you need a proxy?**

| Scenario | Proxy needed? |
|----------|---------------|
| OpenAI API (`api.openai.com`) | Usually no — OpenAI sets CORS headers |
| Anthropic API (`api.anthropic.com`) | Yes — Anthropic does not allow browser-origin requests |
| Azure OpenAI | Depends on your Azure CORS configuration |
| Self-hosted LLMs (Ollama, vLLM) | Usually no — you control the server's CORS settings |
| Any API behind a corporate firewall | Yes — use a proxy in the same network |

A proxy sits between the browser and the AI API. The browser sends requests to the proxy (which allows CORS), and the proxy forwards them to the actual AI API.

```
Browser  →  Proxy (your server, allows CORS)  →  AI API (OpenAI, Anthropic, etc.)
```

## Minimal Node.js Proxy

A simple proxy server that forwards requests and adds CORS headers:

```javascript
import { createServer } from 'http';

const TARGET = process.env.AI_TARGET_URL; // e.g. https://api.anthropic.com
const PORT = process.env.PORT || 3001;

createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key-anthropic, anthropic-version, anthropic-dangerous-direct-browser-access');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Read incoming request body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  // Forward to target API
  const targetUrl = TARGET + req.url;
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      ...Object.fromEntries(
        Object.entries(req.headers).filter(([k]) =>
          ['content-type', 'authorization', 'x-api-key-anthropic', 'anthropic-version'].includes(k)
        )
      ),
    },
    body,
  });

  // Stream the response back with CORS headers
  res.writeHead(response.status, {
    'Content-Type': response.headers.get('content-type'),
    'Access-Control-Allow-Origin': '*',
  });

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}).listen(PORT, () => {
  console.log(`AI proxy listening on :${PORT}, forwarding to ${TARGET}`);
});
```

Save as `ai-proxy.js` and run:

```bash
AI_TARGET_URL=https://api.anthropic.com node ai-proxy.js
```

Then configure the editor to use the proxy:

```bash
AI_PROVIDER=anthropic
AI_ENDPOINT=http://localhost:3001/v1/messages
AI_API_KEY=sk-ant-xxx
```

## Nginx Reverse Proxy

For production deployments, nginx is a common choice:

```nginx
server {
    listen 3001;

    location /openai/ {
        # Rewrite /openai/v1/... → /v1/...
        rewrite ^/openai(/.*)$ $1 break;

        proxy_pass https://api.openai.com;
        proxy_set_header Host api.openai.com;
        proxy_set_header Connection '';
        proxy_http_version 1.1;

        # SSE streaming support
        proxy_buffering off;
        proxy_cache off;

        # CORS
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'POST, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    location /anthropic/ {
        rewrite ^/anthropic(/.*)$ $1 break;

        proxy_pass https://api.anthropic.com;
        proxy_set_header Host api.anthropic.com;
        proxy_set_header Connection '';
        proxy_http_version 1.1;

        proxy_buffering off;
        proxy_cache off;

        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'POST, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Content-Type, x-api-key-anthropic, anthropic-version, anthropic-dangerous-direct-browser-access' always;

        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
```

Then point the editor at the proxy:

```bash
# OpenAI via proxy
AI_ENDPOINT=http://your-proxy:3001/openai/v1/chat/completions

# Anthropic via proxy
AI_PROVIDER=anthropic
AI_ENDPOINT=http://your-proxy:3001/anthropic/v1/messages
```

## Docker Compose with Proxy

Run the editor and an nginx proxy together:

```yaml
services:
  editor:
    image: datacontract-editor
    ports:
      - "4173:4173"
    environment:
      - AI_ENABLED=true
      - AI_PROVIDER=anthropic
      - AI_ENDPOINT=http://ai-proxy:3001/v1/messages
      - AI_API_KEY=${ANTHROPIC_API_KEY}

  ai-proxy:
    image: nginx:alpine
    ports:
      - "3001:3001"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf:ro
```

## Server-Side API Key (Secure Proxy)

For production, you may want to keep the API key on the server instead of exposing it to the browser. The proxy injects the key:

```javascript
import { createServer } from 'http';

const TARGET = process.env.AI_TARGET_URL;
const API_KEY = process.env.AI_API_KEY;       // kept server-side
const PROVIDER = process.env.AI_PROVIDER || 'openai';
const PORT = process.env.PORT || 3001;

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  // Build auth headers server-side
  const headers = { 'Content-Type': 'application/json' };
  if (PROVIDER === 'anthropic') {
    headers['x-api-key-anthropic'] = API_KEY;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const response = await fetch(TARGET + req.url, {
    method: req.method,
    headers,
    body,
  });

  res.writeHead(response.status, {
    'Content-Type': response.headers.get('content-type'),
    'Access-Control-Allow-Origin': '*',
  });

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}).listen(PORT, () => {
  console.log(`Secure AI proxy on :${PORT}`);
});
```

With a secure proxy, configure the editor **without** an API key — the proxy adds it:

```bash
AI_PROVIDER=anthropic
AI_ENDPOINT=http://localhost:3001/v1/messages
AI_API_KEY=not-used    # required to enable AI, but proxy handles real auth
```
