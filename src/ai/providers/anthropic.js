/**
 * Anthropic Provider Adapter
 *
 * Handles communication with the Anthropic Messages API
 * using SSE streaming and native Anthropic tool format.
 */

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

/**
 * Build HTTP headers for Anthropic API
 * @param {object} config - API configuration
 * @returns {object} Headers object
 */
export function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };

  if (config.apiKey) {
    const authHeader = config.authHeader || 'x-api-key-anthropic';
    if (authHeader === 'bearer') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else {
      headers[authHeader] = config.apiKey;
    }
  }

  // Add custom headers if provided (can override defaults)
  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  return headers;
}

/**
 * Build request body for Anthropic Messages API
 * @param {Array} messages - Chat messages
 * @param {Array} tools - Tool definitions (already in Anthropic format)
 * @param {object} config - API configuration
 * @returns {object} Request body
 */
export function buildRequestBody(messages, tools, config) {
  // Extract system messages into top-level system field
  const systemMessages = messages.filter((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');

  // Convert message content strings to block arrays
  const convertedMessages = nonSystemMessages.map((msg) => {
    // If content is already an array of blocks, keep it
    if (Array.isArray(msg.content)) {
      return msg;
    }
    // Convert string content to text block array
    if (typeof msg.content === 'string') {
      return {
        ...msg,
        content: [{ type: 'text', text: msg.content }],
      };
    }
    // null/undefined content (e.g., tool-only assistant messages) - keep as-is
    return msg;
  });

  // Fall back to default Anthropic model if no model set or if model looks like an OpenAI model
  let model = config.model;
  if (!model || model.startsWith('gpt-')) {
    model = DEFAULT_ANTHROPIC_MODEL;
  }

  const body = {
    model,
    stream: true,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    messages: convertedMessages,
  };

  // Add system prompt if present
  if (systemMessages.length > 0) {
    body.system = systemMessages.map((m) => m.content).join('\n\n');
  }

  // Add tools if provided
  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = { type: 'auto' };
  }

  return body;
}

/**
 * Parse SSE stream from Anthropic Messages API
 * @param {ReadableStream} stream - Response body stream
 * @param {object} callbacks - Callback functions
 */
export async function parseStream(stream, callbacks) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let toolCallIndex = -1;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));

          // error — surface stream errors
          if (json.type === 'error') {
            throw new Error(json.error?.message || 'Anthropic API stream error');
          }

          // content_block_start — new tool_use block
          if (json.type === 'content_block_start' && json.content_block?.type === 'tool_use') {
            toolCallIndex++;
            callbacks.onToolCallDelta?.([
              {
                index: toolCallIndex,
                id: json.content_block.id,
                function: { name: json.content_block.name },
              },
            ]);
          }

          // content_block_delta — text or tool input
          if (json.type === 'content_block_delta') {
            if (json.delta?.type === 'text_delta') {
              callbacks.onContent?.(json.delta.text);
            } else if (json.delta?.type === 'input_json_delta') {
              callbacks.onToolCallDelta?.([
                {
                  index: toolCallIndex,
                  function: { arguments: json.delta.partial_json },
                },
              ]);
            }
          }

          // message_delta — stop reason
          if (json.type === 'message_delta' && json.delta?.stop_reason) {
            const reason =
              json.delta.stop_reason === 'tool_use'
                ? 'tool_calls'
                : json.delta.stop_reason === 'end_turn'
                  ? 'stop'
                  : json.delta.stop_reason;
            callbacks.onFinish?.(reason);
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
 * Translate tools from OpenAI format to Anthropic format
 * @param {Array} tools - Tools in OpenAI format
 * @returns {Array} Tools in Anthropic format
 */
export function translateToolsToWireFormat(tools) {
  return tools.map((tool) => ({
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters,
  }));
}

/**
 * Format tool result messages for next conversation round (Anthropic format)
 * @param {Array} toolCalls - Tool calls from assistant (internal format)
 * @param {Array} toolResults - Tool execution results
 * @param {string} assistantContent - Assistant's text content
 * @returns {Array} Messages to append to conversation
 */
export function formatToolResultMessages(toolCalls, toolResults, assistantContent) {
  // Build assistant content blocks
  const contentBlocks = [];

  if (assistantContent) {
    contentBlocks.push({ type: 'text', text: assistantContent });
  }

  for (const tc of toolCalls) {
    let input = {};
    try {
      input = JSON.parse(tc.function.arguments || '{}');
    } catch {
      // Use empty object if JSON is invalid
    }
    contentBlocks.push({
      type: 'tool_use',
      id: tc.id,
      name: tc.function.name,
      input,
    });
  }

  // Build user message with tool_result blocks
  const toolResultBlocks = toolResults.map((tr) => ({
    type: 'tool_result',
    tool_use_id: tr.tool_call_id,
    content: tr.content,
  }));

  return [
    {
      role: 'assistant',
      content: contentBlocks,
    },
    {
      role: 'user',
      content: toolResultBlocks,
    },
  ];
}
