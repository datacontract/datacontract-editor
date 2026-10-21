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
| `CUSTOMIZATION_CONFIG` | - | Path (inside the container) to a `customization.yaml`, see [CUSTOMIZATION.md](CUSTOMIZATION.md) |
| `SCHEMA_URL` | - | JSON Schema URL the data contract is validated against (instead of the built-in ODCS schemas) |
| `INITIAL_YAML_FILE` | - | Path (inside the container) to a data contract YAML that new sessions start with |
| `CONFIG_JSON` | - | Path (inside the container) to your own `config.json`; used as is, and the variables above that go into `config.json` are ignored |

The initial data contract only replaces the built-in example: a browser session that already holds a contract keeps it on reload.

```bash
# Start with your own data contract, validated against your own schema
docker run -p 4173:4173 \
  -v ./acme-orders.odcs.yaml:/config/acme-orders.odcs.yaml \
  -e INITIAL_YAML_FILE=/config/acme-orders.odcs.yaml \
  -e SCHEMA_URL=https://example.org/schemas/acme-data-contract-schema.json \
  datacontract-editor

# Or bring a complete config.json (see the schema below)
docker run -p 4173:4173 \
  -v ./config.json:/config/config.json \
  -e CONFIG_JSON=/config/config.json \
  datacontract-editor
```

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
  timeoutSeconds: 300,              // Give up on a test after this many seconds (default 300)
}
```

A running test can be cancelled at any time with the Cancel button, or with `editor.cancelTest()` when embedded.

### Full Embed Configuration

```javascript
init({
  // Container
  container: '#editor',              // CSS selector or HTMLElement

  // Content
  yaml: '...',                       // Initial YAML content
  // The ODCS versions you support, each with the JSON schema a document of that version is
  // validated against. The default is what new contracts get and what the Migrate action in
  // Fundamentals offers to documents on an older version. Omit for the built-in default (v3.2.0, with v3.1.0 documents validated against the v3.1.0 schema).
  odcsVersions: [
    { version: 'v3.2.0', schema: 'https://.../odcs-json-schema-v3.2.0.json', default: true },
    { version: 'v3.1.0', schema: 'https://.../odcs-json-schema-v3.1.0.json' },
  ],
  schemaUrl: 'https://...',          // Deprecated: a single schema URL; use odcsVersions

  // Views
  availableViews: ['yaml', 'form', 'diagram'],
  initialView: 'yaml',
  showPreview: true,

  // Mode
  mode: 'SERVER',                    // 'SERVER', 'DESKTOP', 'CLI', or 'EMBEDDED'
                                     // CLI: bound to a single local file (datacontract edit),
                                     // Save button only, no New/Load Example/Open menu
  filePath: null,                    // Path of the edited file, shown in the header (CLI mode)

  // Callbacks (EMBEDDED mode)
  onSave: (yaml, { markers, yamlParseError }) => {},  // return false to prevent clearing dirty state
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
  semantics: {                       // Semantic ontology tree (browse dialog + browse panel)
    baseUrl: '/api/semantics',       // GET `${baseUrl}/tree` returns the tree
    batchResolveUrl: null,           // POST { urls } -> { url: definition } to batch-resolve links
    definitionAcceptHeader: 'application/json'
  },
  dataProducts: {                    // Data products browse panel (upstream + all)
    upstreamUrl: '/api/upstream',    // GET returns [{ dataProduct: { externalId, name },
                                     //   contracts: [{ externalId, title, version,
                                     //     schemas: [{ name, description, properties: [...] }] }] }]
    productsUrl: '/api/products',    // GET returns [{ externalId, name }] (all products with contracts)
    contractsBaseUrl: '/api/products', // GET `${contractsBaseUrl}/{externalId}/contracts` -> contracts as in upstreamUrl
    productDetailsUrlTemplate: '/dataproducts/{externalId}',   // "open details" target of tree products
    contractDetailsUrlTemplate: '/datacontracts/{externalId}', // "open details" target of tree contracts/schemas/properties
    productUriTemplate: '/dataproducts/{externalId}'           // canonical product URL for lineage URIs (defaults to productDetailsUrlTemplate)
  },
  assets: {                          // Assets browse panel
    url: '/api/server-assets',       // With servers: POST { servers } -> [{ server, type, complete, assets: [{ externalId,
                                     //   name, type, description, iconUrl, physicalName, properties: [...] }] }]
                                     //   complete: false marks a server whose location is incomplete
                                     //   truncated: true tells that the server has more tables than listed
    catalogUrl: '/api/assets',       // Without servers: GET (top level), ?parent=<externalId> (children) or
                                     //   ?query=<text> (search, 3+ characters) -> { assets: [{ ..., hasChildren }], truncated }
                                     //   An incomplete server browses it with ?serverType=<type> (top level only)
    serversUrl: '/api/asset-servers', // Server typeahead: GET ?query=<text> -> [{ assetExternalId,
                                     //   name, qualifiedName, assetType, iconUrl, server: { type, ...location, customProperties } }]
                                     //   Picking one fills the server's type and location; an assetId is never filled in
    assetDetailsUrlTemplate: '/assets/{externalId}'            // "open details" target of tree assets
  },

  autoValues: {                      // Derived values for custom properties with `auto: true`
    url: '/api/auto-values'          // POST { yaml } -> { properties: { <property>: { values, detail?, warning? } } }
  },

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
  },
  "yaml": "apiVersion: v3.2.0\nkind: DataContract\nid: acme-orders\n...",
  "schemaUrl": "https://example.org/schemas/acme-data-contract-schema.json"
}
```

`yaml` and the schema keys work as in the embed API: `yaml` is the data contract new sessions start with, and `odcsVersions` (or the single, deprecated `schemaUrl`) sets the JSON schemas the contract is validated against. Without `yaml` in `config.json`, a `data-contract.yaml` served next to the app is used (that is what `INITIAL_YAML_FILE` sets up).

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
