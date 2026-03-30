# Anthropic Provider Support

**Date:** 2026-03-30
**Status:** Approved

## Summary

Add support for Anthropic Claude models as an AI provider alongside the existing OpenAI-compatible provider. Uses a provider adapter pattern to keep provider-specific logic isolated while sharing orchestration code.

## Architecture: Provider Adapter Layer

Each provider is a module in `src/ai/providers/` that implements a common interface. `aiService.js` becomes an orchestrator that delegates format-specific work to the active provider.

### File Structure

```
src/ai/
├── aiService.js              # Orchestrator — delegates to provider, owns tool registry
├── providers/
│   ├── openai.js             # Extracted from current aiService.js
│   └── anthropic.js          # New Anthropic implementation
```

### Provider Interface

Each provider module exports:

```js
export function buildHeaders(config) → object
export function buildRequestBody(messages, tools, config) → object
export async function parseStream(responseBody, callbacks) → void
export function translateToolsToWireFormat(tools) → array
export function formatToolResultMessages(toolCalls, toolResults) → array
```

### Provider Selection

A new `provider` config field (`"openai"` | `"anthropic"`) determines which adapter is used. `aiService.js` has a `getProvider(config)` function that returns the correct module.

The internal message and tool call format remains OpenAI-style throughout the orchestration layer. Each provider translates at the boundary.

## Configuration

### New Config Field

`provider` — added to all config surfaces:

- **Build-time:** `VITE_AI_PROVIDER` env var
- **Docker runtime:** `AI_PROVIDER` env var → `config.json`
- **Embed API:** `config.ai.provider`

Default: `"openai"`.

### Defaults

```js
// src/config/defaults.js
export const DEFAULT_AI_CONFIG = {
  enabled: !!import.meta.env.VITE_AI_API_KEY,
  provider: import.meta.env.VITE_AI_PROVIDER || 'openai',
  endpoint: import.meta.env.VITE_AI_ENDPOINT || '',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-4o',
  authHeader: import.meta.env.VITE_AI_AUTH_HEADER || 'bearer',
  maxTokens: 16384,
  temperature: 0.7,
};
```

When `provider` is `"anthropic"` and no explicit model is set, the Anthropic provider defaults to `claude-sonnet-4-20250514`.

### Auth Handling

- **OpenAI:** Unchanged — `Authorization: Bearer <key>` or `api-key: <key>` based on `authHeader` config.
- **Anthropic:** Always uses `x-api-key: <key>` + `anthropic-version: 2023-06-01` + `anthropic-dangerous-direct-browser-access: true`. The `authHeader` config field is ignored.

### CORS

Users are responsible for providing a reachable endpoint. The Anthropic API does not set CORS headers, so direct browser calls to `api.anthropic.com` require a proxy. This is the same model as existing OpenAI setups that need a proxy.

## Anthropic Provider Specifics

### Request Format

- System message extracted from messages array → top-level `system` field
- Messages use `content` as array of blocks: `[{ type: "text", text: "..." }]`
- Tool definitions use `input_schema` instead of OpenAI's `parameters`
- Body fields: `model`, `max_tokens`, `temperature`, `system`, `messages`, `tools`, `stream: true`

### Streaming Format

Anthropic SSE uses typed events:

| Event | Content |
|-------|---------|
| `message_start` | Message metadata |
| `content_block_start` | Block type — `text` or `tool_use` (with name + id) |
| `content_block_delta` | `text_delta` for text, `input_json_delta` for tool args |
| `content_block_stop` | Block complete |
| `message_delta` | `stop_reason`: `"end_turn"` or `"tool_use"` |
| `message_stop` | Message complete |

### Tool Call Translation

Internal format (OpenAI-style, used by orchestrator):
```js
{ id, type: "function", function: { name, arguments } }
```

The Anthropic provider translates:
- **Outbound:** OpenAI tool definitions → Anthropic tool definitions (`parameters` → `input_schema`)
- **Inbound:** Anthropic `tool_use` content blocks → OpenAI-style tool call objects
- **Tool results:** `{ role: "tool", tool_call_id, content }` → `{ role: "user", content: [{ type: "tool_result", tool_use_id, content }] }`

## File Changes

### `src/ai/aiService.js` — Refactor to orchestrator

- Extract SSE parsing and request-building into `src/ai/providers/openai.js`
- Add `getProvider(config)` function
- `streamChatCompletion` delegates to provider for headers, body, stream parsing
- Tool registry and `chatWithTools`/`executeToolCalls` unchanged

### `src/ai/providers/openai.js` — Extracted from aiService.js

Move of existing logic. No behavior change.

### `src/ai/providers/anthropic.js` — New

Implements provider interface for Anthropic Messages API.

### `src/config/defaults.js`

Add `provider` field to `DEFAULT_AI_CONFIG`.

### `src/config/runtimeConfig.js`

Pass through `provider` field from runtime config.

### `src/ai/AiChat.jsx`

- Pass `provider` in config to `chatWithTools`
- Update "not configured" UI to show provider-appropriate examples

### `src/ai/useAiSuggestion.js`

No changes — already passes full `aiConfig` through.

### `bin/datacontract-editor.js`

Map `AI_PROVIDER` env var to `config.json`.

## Testing

- Verify OpenAI provider still works identically after extraction (no regression)
- Test Anthropic provider with streaming, tool calls, and field suggestions
- Test provider selection via config
- Test "not configured" UI shows correct examples per provider
