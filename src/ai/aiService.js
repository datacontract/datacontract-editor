/**
 * AI Service - Pure browser-based OpenAI-compatible API client
 *
 * Supports any OpenAI-compatible endpoint:
 * - OpenAI API
 * - Azure OpenAI
 * - OpenRouter
 * - Local LLMs (Ollama, vLLM, llama.cpp, etc.)
 * - Any OpenAI-compatible API
 */

import { DEFAULT_AI_CONFIG } from '../config/defaults.js';

/**
 * Tool registry - stores registered tools with their handlers
 */
const toolRegistry = new Map();

/**
 * Register a tool that can be called by the AI
 *
 * @param {string} name - Tool name
 * @param {object} definition - OpenAI function definition
 * @param {function} handler - Async function to execute when tool is called
 */
export function registerTool(name, definition, handler) {
  toolRegistry.set(name, { definition, handler });
}

/**
 * Unregister a tool
 * @param {string} name - Tool name to remove
 */
export function unregisterTool(name) {
  toolRegistry.delete(name);
}

/**
 * Clear all registered tools
 */
export function clearTools() {
  toolRegistry.clear();
}

/**
 * Get all registered tools in OpenAI format
 * @returns {Array} Array of tool definitions
 */
export function getRegisteredTools() {
  return Array.from(toolRegistry.values()).map(({ definition }) => ({
    type: 'function',
    function: definition,
  }));
}

/**
 * Execute a tool by name
 * @param {string} name - Tool name
 * @param {object} args - Tool arguments
 * @param {object} context - Context object (yaml, store, etc.)
 * @returns {Promise<any>} Tool result
 */
export async function executeTool(name, args, context = {}) {
  const tool = toolRegistry.get(name);
  if (!tool) {
    throw new Error(`Tool not found: ${name}`);
  }
  return await tool.handler(args, context);
}

/**
 * Check if a tool is registered
 * @param {string} name - Tool name
 * @returns {boolean}
 */
export function hasTool(name) {
  return toolRegistry.has(name);
}

/**
 * Parse SSE stream from OpenAI-compatible API
 * @param {ReadableStream} stream - Response body stream
 * @param {object} callbacks - Callback functions
 */
async function parseSSEStream(stream, callbacks) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

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
 * Send a chat completion request to OpenAI-compatible API
 *
 * @param {object} options - Request options
 * @param {Array} options.messages - Chat messages
 * @param {Array} options.tools - Tool definitions (optional)
 * @param {object} options.config - API configuration
 * @param {AbortSignal} options.signal - Abort signal
 * @param {object} options.callbacks - Stream callbacks
 * @returns {Promise<object>} Final response with content and tool calls
 */
export async function streamChatCompletion({
  messages,
  tools = [],
  config = {},
  signal,
  callbacks = {},
}) {
  const mergedConfig = { ...DEFAULT_AI_CONFIG, ...config };
  const { endpoint, model, apiKey, maxTokens, temperature, authHeader } = mergedConfig;

  // Build headers
  const headers = {
    'Content-Type': 'application/json',
  };

  // Set auth header based on authHeader config
  if (apiKey) {
    if (authHeader === 'api-key') {
      headers['api-key'] = apiKey;
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  // Add custom headers if provided (can override auth)
  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  // Build request body
  const body = {
    model,
    messages,
    stream: true,
    max_completion_tokens: maxTokens,
    temperature,
  };

  // Add tools if enabled (default: true)
  let toolCount = 0;
  if (config.useTools !== false) {
    const allTools = [...tools, ...getRegisteredTools()];
    if (allTools.length > 0) {
      body.tools = allTools;
      body.tool_choice = 'auto';
      toolCount = allTools.length;
    }
  }

  // Make request
  console.log('[AI] Request:', { endpoint, model, tools: toolCount, messages });
  const response = await fetch(endpoint, {
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

  // Parse streaming response
  let content = '';
  const toolCalls = [];
  let currentToolCalls = {};

  await parseSSEStream(response.body, {
    onContent: (chunk) => {
      content += chunk;
      callbacks.onContent?.(chunk, content);
    },
    onToolCallDelta: (deltas) => {
      for (const delta of deltas) {
        const idx = delta.index;
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
      // Convert currentToolCalls object to array
      Object.values(currentToolCalls).forEach(tc => toolCalls.push(tc));
      callbacks.onFinish?.(reason, { content, toolCalls });
    },
  });

  console.log('[AI] Response:', { content, toolCalls: toolCalls.map(t => t.function?.name) });
  return { content, toolCalls };
}

/**
 * Execute tool calls and get results
 *
 * @param {Array} toolCalls - Array of tool calls from AI response
 * @param {object} context - Context for tool execution
 * @returns {Promise<Array>} Tool results in message format
 */
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
        // Log the raw arguments for debugging
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

/**
 * Complete chat with automatic tool execution
 *
 * @param {object} options - Options
 * @returns {Promise<object>} Final response
 */
export async function chatWithTools({
  messages,
  tools = [],
  config = {},
  context = {},
  signal,
  callbacks = {},
  maxToolRounds = 5,
}) {
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
      // No more tool calls, we're done
      break;
    }

    allToolCalls = [...allToolCalls, ...result.toolCalls];

    // Execute tool calls
    callbacks.onToolCallsStart?.(result.toolCalls);
    const toolResults = await executeToolCalls(result.toolCalls, context);
    callbacks.onToolCallsComplete?.(result.toolCalls, toolResults);

    // Add assistant message with tool calls
    currentMessages.push({
      role: 'assistant',
      content: result.content || null,
      tool_calls: result.toolCalls,
    });

    // Add tool results
    currentMessages.push(...toolResults);
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
