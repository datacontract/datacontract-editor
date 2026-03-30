# Configuration

The Data Contract Editor supports multiple deployment modes.

## Deployment Modes

### 1. Local Development / Azure Static Web Apps

Configuration via Vite build-time environment variables.

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit with your values
VITE_AI_PROVIDER=openai           # 'openai' or 'anthropic'
VITE_AI_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=sk-xxx
VITE_AI_MODEL=gpt-4o
VITE_AI_AUTH_HEADER=bearer
```

For Azure Static Web Apps, set these in Azure portal → Configuration → Application settings.

### 2. Docker (Standalone)

Configuration via environment variables that generate `/config.json` at startup.

```bash
# Without AI
docker run -p 4173:4173 datacontract-editor

# With AI
docker run -p 4173:4173 \
  -e AI_ENABLED=true \
  -e AI_ENDPOINT=https://api.openai.com/v1/chat/completions \
  -e AI_API_KEY=sk-xxx \
  datacontract-editor
```

**Environment Variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_ENABLED` | `false` | Enable AI assistant |
| `AI_PROVIDER` | `openai` | `openai` or `anthropic` |
| `AI_ENDPOINT` | - | API endpoint URL |
| `AI_API_KEY` | - | API key for the endpoint |
| `AI_MODEL` | `gpt-4o` | Model name (provider-specific) |
| `AI_AUTH_HEADER` | `bearer` | `bearer` or `api-key` (OpenAI only) |
| `TESTS_SERVER_URL` | - | Data contract test server URL |

### 2. Embed (JavaScript API)

Configuration via JavaScript when embedding in another application.

```html
<div id="editor"></div>
<script type="module">
  import { init } from './dist/datacontract-editor.es.js';

  const editor = init({
    container: '#editor',
    yaml: '...',
    ai: {
      enabled: true,
      provider: 'openai',  // or 'anthropic'
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'sk-xxx',
    },
  });
</script>
```

## Configuration Reference

### AI Configuration

```javascript
ai: {
  enabled: true,                    // Enable/disable AI assistant
  provider: 'openai',              // 'openai' or 'anthropic'
  endpoint: 'https://...',          // API endpoint (required)
  apiKey: 'sk-xxx',                 // API key (required)
  model: 'gpt-4o',                  // Model name (provider-specific)
  authHeader: 'bearer',             // 'bearer' or 'api-key' (OpenAI only)
  headers: {},                      // Additional headers
  tools: [],                        // Custom AI tools (embed mode only)
}
```

**Providers:**

| Provider | `provider` | Default Model | Endpoint |
|----------|------------|---------------|----------|
| OpenAI (and compatible) | `openai` | `gpt-4o` | `https://api.openai.com/v1/chat/completions` |
| Anthropic | `anthropic` | `claude-sonnet-4-20250514` | `https://api.anthropic.com/v1/messages` |

The `openai` provider works with any OpenAI-compatible API: OpenAI, Azure OpenAI, Ollama, OpenRouter, LiteLLM, vLLM, etc.

**Auth Header (OpenAI provider only):**
- `bearer` (default): Sends `Authorization: Bearer <key>`
- `api-key`: Sends `api-key: <key>` header (used by Azure OpenAI)

The Anthropic provider always uses `x-api-key` for authentication (the `authHeader` setting is ignored).

### Tests Configuration

```javascript
tests: {
  enabled: true,                    // Enable test runner
  dataContractCliApiServerUrl: 'https://api.datacontract.com',  // Test server URL
}
```

### Full Embed Configuration

```javascript
init({
  // Container
  container: '#editor',              // CSS selector or HTMLElement

  // Content
  yaml: '...',                       // Initial YAML content
  schemaUrl: 'https://...',          // JSON schema URL for validation

  // Views
  availableViews: ['yaml', 'form', 'diagram'],
  initialView: 'yaml',
  showPreview: true,

  // Mode
  mode: 'SERVER',                    // 'SERVER', 'DESKTOP', or 'EMBEDDED'

  // Callbacks (EMBEDDED mode)
  onSave: (yaml) => {},
  onCancel: () => {},
  onDelete: () => {},
  showDelete: true,

  // Data
  teams: [{ id: 'team-1', name: 'Team 1' }],
  domains: [{ id: 'domain-1', name: 'Domain 1' }],

  // Features
  tests: { ... },
  ai: { ... },
  managedTags: [{ tag: 'tag-1', href: 'https://example.com/tag-1' }],
  allowUnmanagedTags: true,          // allow to use tags that are not specified as managed (default: true)

  // Advanced
  persistence: 'none',              // 'localStorage', 'sessionStorage', or 'none' (default: 'none')
  basePath: null,                    // Base path for assets
  customizations: null,              // UI customizations
});
```

### Persistence

The `persistence` option controls how the editor stores state in the browser:

| Value | Behavior |
|-------|----------|
| `'none'` | No browser storage (default for embedded mode) |
| `'sessionStorage'` | Persists across page refresh, clears when tab closes (default for standalone mode, configurable via `VITE_PERSISTENCE` env var) |
| `'localStorage'` | Persists indefinitely across sessions |

**Deprecated:** `enablePersistence` (boolean) still works for backward compatibility: `true` maps to `'localStorage'`, `false` maps to `'none'`.

## Custom AI Tools (Embed Only)

Register custom tools the AI can use:

```javascript
const editor = init({
  ai: {
    enabled: true,
    endpoint: '...',
    apiKey: '...',
    tools: [{
      name: 'lookupTerm',
      description: 'Look up a business term definition',
      parameters: {
        type: 'object',
        properties: {
          term: { type: 'string', description: 'Term to look up' }
        },
        required: ['term']
      },
      handler: async ({ term }, context) => {
        // context.yaml contains current contract
        return { term, definition: '...' };
      }
    }]
  }
});

// Or register after init
editor.ai.registerTool({ name: '...', ... });
```

## config.json Schema

For Docker deployments, the generated config.json follows this schema:

```json
{
  "ai": {
    "enabled": true,
    "provider": "openai",
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "apiKey": "sk-xxx",
    "model": "gpt-4o",
    "authHeader": "bearer"
  },
  "tests": {
    "enabled": true,
    "dataContractCliApiServerUrl": "https://api.datacontract.com"
  }
}
```

## Examples

### Docker Compose

```yaml
services:
  editor:
    image: datacontract-editor
    ports:
      - "4173:4173"
    environment:
      - AI_ENABLED=true
      - AI_ENDPOINT=https://api.openai.com/v1/chat/completions
      - AI_API_KEY=${OPENAI_API_KEY}
```

### Embed

```javascript
init({
  container: '#editor',
  ai: {
    enabled: true,
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: 'sk-xxx',
  }
});
```

## AI Proxy Setup

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

### Minimal Node.js Proxy

A simple proxy server that forwards requests and adds CORS headers:

```javascript
import { createServer } from 'http';

const TARGET = process.env.AI_TARGET_URL; // e.g. https://api.anthropic.com
const PORT = process.env.PORT || 3001;

createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access');

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
          ['content-type', 'authorization', 'x-api-key', 'anthropic-version'].includes(k)
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

### Nginx Reverse Proxy

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
        add_header Access-Control-Allow-Headers 'Content-Type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access' always;

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

### Docker Compose with Proxy

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

### Server-Side API Key (Secure Proxy)

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
    headers['x-api-key'] = API_KEY;
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

### Alternative: LiteLLM

[LiteLLM](https://github.com/BerriAI/litellm) is an open-source proxy that provides an OpenAI-compatible interface in front of 100+ LLM providers, including Anthropic. With LiteLLM, you can use the `openai` provider and point the endpoint at LiteLLM:

```bash
# Start LiteLLM with Anthropic backend
litellm --model anthropic/claude-sonnet-4-20250514

# Configure the editor to use LiteLLM (uses OpenAI provider since LiteLLM speaks OpenAI format)
AI_ENDPOINT=http://localhost:4000/v1/chat/completions
AI_API_KEY=sk-xxx
```
