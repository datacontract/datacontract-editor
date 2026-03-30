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
  authHeader: 'bearer',             // Header name for API key (see below)
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

**Auth Header:**

The `authHeader` field controls how the API key is sent. The special value `bearer` sends `Authorization: Bearer <key>`. Any other value is used directly as the header name.

| Provider | Default `authHeader` | Resulting header |
|----------|---------------------|------------------|
| OpenAI | `bearer` | `Authorization: Bearer <key>` |
| Azure OpenAI | `api-key` | `api-key: <key>` |
| Anthropic | `x-api-key-anthropic` | `x-api-key-anthropic: <key>` |
| Custom | any string | `<authHeader>: <key>` |

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

If the AI endpoint does not support CORS (e.g., Anthropic API), you need a proxy between the browser and the API. See [AI_PROXY.md](AI_PROXY.md) for setup guides including Node.js, nginx, Docker Compose, and secure proxy examples.
