/**
 * OpenAI Provider Adapter
 *
 * Handles OpenAI-compatible API communication:
 * - OpenAI API
 * - Azure OpenAI
 * - OpenRouter
 * - Local LLMs (Ollama, vLLM, llama.cpp, etc.)
 * - Any OpenAI-compatible API
 */

/**
 * Build HTTP headers for OpenAI-compatible API
 * @param {object} config - API configuration
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

  // Add custom headers if provided (can override auth)
  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  return headers;
}

/**
 * Build request body for OpenAI-compatible API
 * @param {Array} messages - Chat messages
 * @param {Array} tools - Tool definitions
 * @param {object} config - API configuration
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
 * @param {object} callbacks - Callback functions
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
 * Translate tools to wire format (pass-through for OpenAI)
 * @param {Array} tools - Tools in OpenAI format
 * @returns {Array} Tools in wire format
 */
export function translateToolsToWireFormat(tools) {
  return tools;
}

/**
 * Format tool result messages for next conversation round
 * @param {Array} toolCalls - Tool calls from assistant
 * @param {Array} toolResults - Tool execution results
 * @param {string} assistantContent - Assistant's text content
 * @returns {Array} Messages to append to conversation
 */
export function formatToolResultMessages(toolCalls, toolResults, assistantContent) {
  return [
    {
      role: 'assistant',
      content: assistantContent || null,
      tool_calls: toolCalls,
    },
    ...toolResults,
  ];
}
