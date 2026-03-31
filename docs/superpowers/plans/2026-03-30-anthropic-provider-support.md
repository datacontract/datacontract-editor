# Anthropic Provider Support — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Anthropic Claude as an AI provider alongside OpenAI, using a provider adapter pattern.

**Architecture:** Extract OpenAI-specific logic from `aiService.js` into `src/ai/providers/openai.js`, create a parallel `src/ai/providers/anthropic.js`, and refactor `aiService.js` into a provider-agnostic orchestrator that delegates format-specific work based on `config.provider`.

**Tech Stack:** React, Vite, vanilla JS (no AI SDKs — raw `fetch()` + SSE parsing)

---

## File Structure

```
src/ai/
├── aiService.js              # Orchestrator — delegates to provider, owns tool registry
├── providers/
│   ├── openai.js             # Extracted from current aiService.js (no behavior change)
│   └── anthropic.js          # New Anthropic Messages API implementation
├── AiChat.jsx                # Pass provider config, update "not configured" UI
├── useAiSuggestion.js        # No changes (passes full config through)
├── index.js                  # No changes
└── ...

src/config/
├── defaults.js               # Add `provider` field
└── runtimeConfig.js          # Pass through `provider`

bin/
└── datacontract-editor.js    # Map AI_PROVIDER env var
```

---

### Task 1: Extract OpenAI provider from aiService.js

**Files:**
- Create: `src/ai/providers/openai.js`
- Modify: `src/ai/aiService.js`

- [ ] **Step 1: Create `src/ai/providers/openai.js`**

Extract the OpenAI-specific functions from `aiService.js`. This is a move — no behavior change.

```js
/**
 * OpenAI-compatible provider adapter
 *
 * Supports: OpenAI, Azure OpenAI, OpenRouter, Ollama, vLLM, llama.cpp, etc.
 */

/**
 * Build HTTP headers for OpenAI-compatible API
 * @param {object} config - Merged AI config
 * @returns {object} Headers object
 */
export function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    if (config.authHeader === 'api-key') {
      headers['api-key'] = config.apiKey;
    } else {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }

  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  return headers;
}

/**
 * Build request body for OpenAI-compatible API
 * @param {Array} messages - Chat messages (including system)
 * @param {Array} tools - Tool definitions in OpenAI format
 * @param {object} config - Merged AI config
 * @returns {object} Request body
 */
export function buildRequestBody(messages, tools, config) {
  const body = {
    model: config.model,
    messages,
    stream: true,
    max_completion_tokens: config.maxTokens,
    temperature: config.temperature,
  };

  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  return body;
}

/**
 * Parse SSE stream from OpenAI-compatible API
 * @param {ReadableStream} stream - Response body stream
 * @param {object} callbacks - { onContent, onToolCallDelta, onFinish }
 */
export async function parseStream(stream, callbacks) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const delta = json.choices?.[0]?.delta;
          const finishReason = json.choices?.[0]?.finish_reason;

          if (delta?.content) {
            callbacks.onContent?.(delta.content);
          }

          if (delta?.tool_calls) {
            callbacks.onToolCallDelta?.(delta.tool_calls);
          }

          if (finishReason) {
            callbacks.onFinish?.(finishReason);
          }
        } catch {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Tool definitions are already in OpenAI format — pass through
 * @param {Array} tools - Tools in internal (OpenAI) format
 * @returns {Array} Tools in OpenAI wire format
 */
export function translateToolsToWireFormat(tools) {
  return tools;
}

/**
 * Format tool result messages for the next API call (OpenAI format)
 * @param {Array} toolCalls - Tool calls from the assistant response
 * @param {Array} toolResults - Results from executing tools
 * @returns {Array} Messages to append: [assistant message with tool_calls, ...tool result messages]
 */
export function formatToolResultMessages(toolCalls, toolResults, assistantContent) {
  const messages = [];

  // Assistant message with tool_calls
  messages.push({
    role: 'assistant',
    content: assistantContent || null,
    tool_calls: toolCalls,
  });

  // Tool result messages
  for (const result of toolResults) {
    messages.push({
      tool_call_id: result.tool_call_id,
      role: 'tool',
      name: result.name,
      content: result.content,
    });
  }

  return messages;
}
```

- [ ] **Step 2: Refactor `aiService.js` to use the OpenAI provider**

Replace the inline OpenAI logic in `streamChatCompletion` with calls to the provider. The `parseSSEStream` function is removed (moved to provider). The tool registry and `chatWithTools`/`executeToolCalls` stay.

Replace the entire `aiService.js` with:

```js
/**
 * AI Service - Provider-agnostic orchestrator
 *
 * Delegates format-specific work to provider adapters in ./providers/
 * Owns the tool registry and multi-round tool execution loop.
 */

import { DEFAULT_AI_CONFIG } from '../config/defaults.js';
import { isSafeKey } from '../utils/safeProperty.js';
import * as openaiProvider from './providers/openai.js';
import * as anthropicProvider from './providers/anthropic.js';

/**
 * Get the provider adapter based on config
 * @param {object} config - AI config with `provider` field
 * @returns {object} Provider module
 */
function getProvider(config) {
  if (config.provider === 'anthropic') {
    return anthropicProvider;
  }
  return openaiProvider;
}

// --- Tool Registry (unchanged) ---

const toolRegistry = new Map();

export function registerTool(name, definition, handler) {
  toolRegistry.set(name, { definition, handler });
}

export function unregisterTool(name) {
  toolRegistry.delete(name);
}

export function clearTools() {
  toolRegistry.clear();
}

export function getRegisteredTools() {
  return Array.from(toolRegistry.values()).map(({ definition }) => ({
    type: 'function',
    function: definition,
  }));
}

export async function executeTool(name, args, context = {}) {
  const tool = toolRegistry.get(name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  return await tool.handler(args, context);
}

export function hasTool(name) {
  return toolRegistry.has(name);
}

// --- Streaming Chat Completion ---

export async function streamChatCompletion({
  messages,
  tools = [],
  config = {},
  signal,
  callbacks = {},
}) {
  const mergedConfig = { ...DEFAULT_AI_CONFIG, ...config };
  const provider = getProvider(mergedConfig);

  // Build headers via provider
  const headers = provider.buildHeaders(mergedConfig);

  // Gather tools in internal (OpenAI) format, then translate for wire
  let allTools = [];
  if (config.useTools !== false) {
    allTools = [...tools, ...getRegisteredTools()];
  }
  const wireTools = allTools.length > 0
    ? provider.translateToolsToWireFormat(allTools)
    : [];

  // Build request body via provider
  const body = provider.buildRequestBody(messages, wireTools, mergedConfig);

  // Make request
  console.log('[AI] Request:', {
    endpoint: mergedConfig.endpoint,
    model: mergedConfig.model,
    provider: mergedConfig.provider || 'openai',
    tools: allTools.length,
    messages,
  });

  const response = await fetch(mergedConfig.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorData.message || errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  // Parse streaming response via provider
  let content = '';
  const toolCalls = [];
  let currentToolCalls = {};

  await provider.parseStream(response.body, {
    onContent: (chunk) => {
      content += chunk;
      callbacks.onContent?.(chunk, content);
    },
    onToolCallDelta: (deltas) => {
      for (const delta of deltas) {
        const idx = delta.index;
        if (!isSafeKey(idx)) continue;
        if (!currentToolCalls[idx]) {
          currentToolCalls[idx] = {
            id: delta.id || `call_${idx}`,
            type: 'function',
            function: { name: '', arguments: '' },
          };
        }
        if (delta.function?.name) {
          currentToolCalls[idx].function.name = delta.function.name;
        }
        if (delta.function?.arguments) {
          currentToolCalls[idx].function.arguments += delta.function.arguments;
        }
      }
      callbacks.onToolCallDelta?.(deltas, currentToolCalls);
    },
    onFinish: (reason) => {
      Object.values(currentToolCalls).forEach(tc => toolCalls.push(tc));
      callbacks.onFinish?.(reason, { content, toolCalls });
    },
  });

  console.log('[AI] Response:', { content, toolCalls: toolCalls.map(t => t.function?.name) });
  return { content, toolCalls };
}

// --- Tool Execution (unchanged) ---

export async function executeToolCalls(toolCalls, context = {}) {
  const results = [];

  for (const toolCall of toolCalls) {
    const name = toolCall.function?.name;
    if (!name) continue;

    try {
      const rawArgs = toolCall.function.arguments || '{}';
      let args;
      try {
        args = JSON.parse(rawArgs);
      } catch (parseError) {
        console.error('[AI] Tool JSON parse error:', name, parseError.message);
        console.error('[AI] Raw arguments (first 500 chars):', rawArgs.slice(0, 500));
        console.error('[AI] Raw arguments (last 200 chars):', rawArgs.slice(-200));
        throw new Error(`Invalid JSON in tool arguments: ${parseError.message}`);
      }
      console.log('[AI] Tool call:', name, args);
      const result = await executeTool(name, args, context);
      console.log('[AI] Tool result:', name, typeof result === 'object' ? JSON.stringify(result).slice(0, 200) : result);

      results.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      });
    } catch (error) {
      console.error('[AI] Tool error:', name, error.message);
      results.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name,
        content: JSON.stringify({ error: error.message }),
      });
    }
  }

  return results;
}

// --- Multi-round chat with tools ---

export async function chatWithTools({
  messages,
  tools = [],
  config = {},
  context = {},
  signal,
  callbacks = {},
  maxToolRounds = 5,
}) {
  const mergedConfig = { ...DEFAULT_AI_CONFIG, ...config };
  const provider = getProvider(mergedConfig);
  let currentMessages = [...messages];
  let round = 0;
  let finalContent = '';
  let allToolCalls = [];

  while (round < maxToolRounds) {
    round++;

    const result = await streamChatCompletion({
      messages: currentMessages,
      tools,
      config,
      signal,
      callbacks: {
        ...callbacks,
        onContent: (chunk, content) => {
          finalContent = content;
          callbacks.onContent?.(chunk, content);
        },
      },
    });

    if (result.toolCalls.length === 0) {
      break;
    }

    allToolCalls = [...allToolCalls, ...result.toolCalls];

    // Execute tool calls
    callbacks.onToolCallsStart?.(result.toolCalls);
    const toolResults = await executeToolCalls(result.toolCalls, context);
    callbacks.onToolCallsComplete?.(result.toolCalls, toolResults);

    // Format tool result messages via provider and append
    const toolMessages = provider.formatToolResultMessages(
      result.toolCalls,
      toolResults,
      result.content,
    );
    currentMessages.push(...toolMessages);
  }

  return { content: finalContent, toolCalls: allToolCalls, messages: currentMessages };
}

export default {
  registerTool,
  unregisterTool,
  clearTools,
  getRegisteredTools,
  executeTool,
  hasTool,
  streamChatCompletion,
  executeToolCalls,
  chatWithTools,
};
```

- [ ] **Step 3: Verify the app still works with the OpenAI provider**

Run the dev server and test the AI chat with an OpenAI-compatible endpoint. The behavior must be identical to before the refactor.

```bash
npm run dev
```

Open the app, configure an OpenAI endpoint, and verify chat + tool calls work.

- [ ] **Step 4: Commit**

```bash
git add src/ai/providers/openai.js src/ai/aiService.js
git commit -m "refactor: extract OpenAI provider adapter from aiService"
```

---

### Task 2: Add the `provider` config field

**Files:**
- Modify: `src/config/defaults.js`
- Modify: `src/config/runtimeConfig.js`
- Modify: `bin/datacontract-editor.js`
- Modify: `src/embed.jsx`

- [ ] **Step 1: Add `provider` to `DEFAULT_AI_CONFIG` in `src/config/defaults.js`**

```js
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

- [ ] **Step 2: Pass through `provider` in `src/config/runtimeConfig.js`**

In `buildEditorConfig`, add `provider` to the AI config block. Find the section that builds `config.ai` when enabled and add the `provider` field:

```js
config.ai = {
  enabled: true,
  provider: runtimeConfig.ai.provider || 'openai',
  endpoint: runtimeConfig.ai.endpoint,
  apiKey: runtimeConfig.ai.apiKey,
  model: runtimeConfig.ai.model || 'gpt-4o',
  authHeader: runtimeConfig.ai.authHeader || 'bearer',
  headers: runtimeConfig.ai.headers || {},
};
```

- [ ] **Step 3: Map `AI_PROVIDER` env var in `bin/datacontract-editor.js`**

This file does not build `config.json` itself — the Docker entrypoint does that. But the file serves `/config.json` from the dist dir. The actual env-var-to-config mapping happens externally (Docker `entrypoint.sh`). No code change needed in this file — just document that `AI_PROVIDER` should be mapped.

However, check if there's a Dockerfile or entrypoint that maps env vars. If there is, add `AI_PROVIDER`. If not, skip this step — the runtime config already picks up whatever is in `config.json`.

- [ ] **Step 4: Ensure `provider` flows through embed API in `src/embed.jsx`**

The embed API already spreads `DEFAULT_AI_CONFIG` into `DEFAULT_CONFIG.ai` at line 102-103. Since `DEFAULT_AI_CONFIG` now includes `provider`, and `init()` merges `userConfig` over defaults at line 399, the `provider` field is already passed through. Verify the config object passed to `chatWithTools` in `AiChat.jsx` includes `provider` — it does, because `AiChat.jsx` passes `aiConfig` which comes from `editorConfig.ai`.

No code change needed here — `provider` flows automatically through the existing config merge.

- [ ] **Step 5: Commit**

```bash
git add src/config/defaults.js src/config/runtimeConfig.js
git commit -m "feat: add provider config field for AI provider selection"
```

---

### Task 3: Implement the Anthropic provider

**Files:**
- Create: `src/ai/providers/anthropic.js`

- [ ] **Step 1: Create `src/ai/providers/anthropic.js`**

```js
/**
 * Anthropic provider adapter
 *
 * Implements the provider interface for the Anthropic Messages API.
 * Translates between internal (OpenAI-style) format and Anthropic wire format.
 */

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Build HTTP headers for Anthropic API
 * @param {object} config - Merged AI config
 * @returns {object} Headers object
 */
export function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': ANTHROPIC_VERSION,
    'anthropic-dangerous-direct-browser-access': 'true',
  };

  if (config.apiKey) {
    headers['x-api-key'] = config.apiKey;
  }

  // Allow custom headers to override (e.g., for proxies)
  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  return headers;
}

/**
 * Extract system message from messages array
 * Anthropic uses a top-level `system` field, not a system role message.
 * @param {Array} messages - Messages array (may contain system role)
 * @returns {{ system: string|null, messages: Array }} Extracted system and remaining messages
 */
function extractSystemMessage(messages) {
  let system = null;
  const filtered = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      // Concatenate multiple system messages if present
      system = system ? system + '\n\n' + msg.content : msg.content;
    } else {
      filtered.push(msg);
    }
  }

  return { system, messages: filtered };
}

/**
 * Convert internal messages to Anthropic format
 * Anthropic requires content as arrays of typed blocks.
 * @param {Array} messages - Messages in internal format (after system extraction)
 * @returns {Array} Messages in Anthropic format
 */
function convertMessages(messages) {
  const result = [];

  for (const msg of messages) {
    if (msg.role === 'user') {
      // If content is a string, wrap in text block
      if (typeof msg.content === 'string') {
        result.push({
          role: 'user',
          content: [{ type: 'text', text: msg.content }],
        });
      } else {
        // Already an array (e.g., tool results) — pass through
        result.push({ role: 'user', content: msg.content });
      }
    } else if (msg.role === 'assistant') {
      if (typeof msg.content === 'string') {
        result.push({
          role: 'assistant',
          content: [{ type: 'text', text: msg.content }],
        });
      } else if (Array.isArray(msg.content)) {
        result.push({ role: 'assistant', content: msg.content });
      } else {
        // Content is null but has tool_calls — will be handled in formatToolResultMessages
        result.push({ role: 'assistant', content: msg.content });
      }
    } else if (msg.role === 'tool') {
      // Should not appear here — tool results are formatted via formatToolResultMessages
      // But handle gracefully in case
      result.push(msg);
    }
  }

  return result;
}

/**
 * Build request body for Anthropic Messages API
 * @param {Array} messages - Chat messages (may include system role)
 * @param {Array} tools - Tool definitions (already in Anthropic wire format)
 * @param {object} config - Merged AI config
 * @returns {object} Request body
 */
export function buildRequestBody(messages, tools, config) {
  const { system, messages: filteredMessages } = extractSystemMessage(messages);
  const convertedMessages = convertMessages(filteredMessages);

  const model = config.model === 'gpt-4o' ? DEFAULT_ANTHROPIC_MODEL : config.model;

  const body = {
    model,
    messages: convertedMessages,
    max_tokens: config.maxTokens || 16384,
    stream: true,
  };

  if (config.temperature !== undefined) {
    body.temperature = config.temperature;
  }

  if (system) {
    body.system = system;
  }

  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = { type: 'auto' };
  }

  return body;
}

/**
 * Parse SSE stream from Anthropic Messages API
 *
 * Anthropic uses typed events:
 * - message_start: message metadata
 * - content_block_start: block type (text or tool_use with name + id)
 * - content_block_delta: text_delta or input_json_delta
 * - content_block_stop: block complete
 * - message_delta: stop_reason
 * - message_stop: message complete
 *
 * @param {ReadableStream} stream - Response body stream
 * @param {object} callbacks - { onContent, onToolCallDelta, onFinish }
 */
export async function parseStream(stream, callbacks) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // Track tool use blocks by index
  const toolBlocks = {};
  let toolIndex = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEventType = null;

      for (const line of lines) {
        const trimmed = line.trim();

        // Track event type from "event: xxx" lines
        if (trimmed.startsWith('event: ')) {
          currentEventType = trimmed.slice(7);
          continue;
        }

        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));

          switch (json.type) {
            case 'content_block_start': {
              const block = json.content_block;
              if (block.type === 'tool_use') {
                // Start of a tool use block — emit delta with id and name
                const idx = json.index;
                toolBlocks[idx] = { id: block.id, name: block.name };
                callbacks.onToolCallDelta?.([{
                  index: toolIndex,
                  id: block.id,
                  function: { name: block.name, arguments: '' },
                }]);
                toolIndex++;
              }
              break;
            }

            case 'content_block_delta': {
              const delta = json.delta;
              if (delta.type === 'text_delta') {
                callbacks.onContent?.(delta.text);
              } else if (delta.type === 'input_json_delta') {
                // Find the tool block for this index
                const idx = json.index;
                const toolBlock = toolBlocks[idx];
                if (toolBlock) {
                  callbacks.onToolCallDelta?.([{
                    index: Object.keys(toolBlocks).indexOf(String(idx)),
                    function: { arguments: delta.partial_json },
                  }]);
                }
              }
              break;
            }

            case 'message_delta': {
              const stopReason = json.delta?.stop_reason;
              if (stopReason) {
                // Map Anthropic stop reasons to OpenAI-style
                const mapped = stopReason === 'tool_use' ? 'tool_calls'
                  : stopReason === 'end_turn' ? 'stop'
                  : stopReason;
                callbacks.onFinish?.(mapped);
              }
              break;
            }
          }
        } catch {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Translate tool definitions from internal (OpenAI) format to Anthropic wire format
 *
 * OpenAI: { type: "function", function: { name, description, parameters } }
 * Anthropic: { name, description, input_schema }
 *
 * @param {Array} tools - Tools in internal (OpenAI) format
 * @returns {Array} Tools in Anthropic wire format
 */
export function translateToolsToWireFormat(tools) {
  return tools.map(tool => ({
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters,
  }));
}

/**
 * Format tool result messages for the next Anthropic API call
 *
 * Anthropic format:
 * - Assistant message with content blocks (text + tool_use blocks)
 * - User message with tool_result blocks
 *
 * @param {Array} toolCalls - Tool calls in internal format
 * @param {Array} toolResults - Results from executing tools
 * @param {string} assistantContent - Text content from the assistant's response
 * @returns {Array} Messages to append
 */
export function formatToolResultMessages(toolCalls, toolResults, assistantContent) {
  const messages = [];

  // Build assistant content blocks
  const assistantBlocks = [];
  if (assistantContent) {
    assistantBlocks.push({ type: 'text', text: assistantContent });
  }
  for (const toolCall of toolCalls) {
    let parsedInput;
    try {
      parsedInput = JSON.parse(toolCall.function.arguments || '{}');
    } catch {
      parsedInput = {};
    }
    assistantBlocks.push({
      type: 'tool_use',
      id: toolCall.id,
      name: toolCall.function.name,
      input: parsedInput,
    });
  }
  messages.push({ role: 'assistant', content: assistantBlocks });

  // Build user message with tool_result blocks
  const resultBlocks = [];
  for (const result of toolResults) {
    resultBlocks.push({
      type: 'tool_result',
      tool_use_id: result.tool_call_id,
      content: result.content,
    });
  }
  messages.push({ role: 'user', content: resultBlocks });

  return messages;
}
```

- [ ] **Step 2: Verify the import in `aiService.js`**

The refactored `aiService.js` from Task 1 already imports `* as anthropicProvider from './providers/anthropic.js'`. Verify the file exists and the import resolves.

```bash
ls src/ai/providers/anthropic.js
```

- [ ] **Step 3: Commit**

```bash
git add src/ai/providers/anthropic.js
git commit -m "feat: add Anthropic provider adapter"
```

---

### Task 4: Update AiChat.jsx for provider-aware "not configured" UI

**Files:**
- Modify: `src/ai/AiChat.jsx`

- [ ] **Step 1: Pass `provider` in config and update the "not configured" message**

In `AiChat.jsx`, find the config object passed to `chatWithTools` (around line 321-330) and ensure `provider` is included. Then update the "not configured" UI (around line 411-429) to show provider-appropriate examples.

Update the config passed to `chatWithTools`:

```js
config: {
  endpoint: aiConfig.endpoint,
  apiKey: aiConfig.apiKey,
  model: aiConfig.model || 'gpt-4o',
  provider: aiConfig.provider || 'openai',
  headers: aiConfig.headers || {},
  authHeader: aiConfig.authHeader || 'bearer',
},
```

Update the "not configured" UI to be provider-aware:

```jsx
if (!isAiConfigured) {
  const isAnthropic = aiConfig.provider === 'anthropic';
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">AI Assistant Not Configured</h3>
          <p className="text-xs text-gray-500 mb-4">
            {isAnthropic
              ? 'Configure an Anthropic API endpoint.'
              : 'Configure an OpenAI-compatible endpoint.'}
          </p>
          <div className="bg-gray-50 rounded-lg p-3 text-left text-xs font-mono text-gray-600">
            {isAnthropic ? (
              <>
                <div><span className="text-gray-400">provider:</span> anthropic</div>
                <div><span className="text-gray-400">endpoint:</span> https://api.anthropic.com/v1/messages</div>
                <div><span className="text-gray-400">apiKey:</span> sk-ant-...</div>
                <div><span className="text-gray-400">model:</span> claude-sonnet-4-20250514</div>
              </>
            ) : (
              <>
                <div><span className="text-gray-400">endpoint:</span> https://api.openai.com/v1/chat/completions</div>
                <div><span className="text-gray-400">apiKey:</span> sk-...</div>
                <div><span className="text-gray-400">model:</span> gpt-4o</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ai/AiChat.jsx
git commit -m "feat: provider-aware AI config UI and pass provider to chatWithTools"
```

---

### Task 5: End-to-end verification with Playwright

**Files:** None (manual testing)

- [ ] **Step 1: Start dev server**

```bash
npm run dev -- --port 9090
```

- [ ] **Step 2: Verify OpenAI provider still works**

Configure the app with an OpenAI endpoint and verify:
- Chat messages stream correctly
- Tool calls (updateContract, readContract) execute and return results
- SparkleButton field suggestions work

- [ ] **Step 3: Verify Anthropic provider works**

Configure the app with `provider: "anthropic"` and an Anthropic-compatible endpoint. Verify:
- Chat messages stream correctly
- Tool calls execute and return results
- System prompt is correctly extracted from messages
- SparkleButton field suggestions work

- [ ] **Step 4: Verify the "not configured" UI**

Check both provider values show the correct example configuration.

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during e2e verification"
```
