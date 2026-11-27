/**
 * OpenAI Responses API Provider Adapter
 *
 * Handles the OpenAI Responses API (`/v1/responses`):
 * - OpenAI API
 * - Azure OpenAI (v1 API: https://{resource}.openai.azure.com/openai/v1/responses)
 *
 * Newer OpenAI reasoning models (gpt-6.1-sol, gpt-6.2) use function tools only on the Responses API.
 *
 * The editor keeps its conversation in the Chat Completions shape ({ role, content } messages and
 * { type: 'function', function: {...} } tools). This adapter translates it into Responses input items
 * and translates the Responses event stream back into the callbacks the other providers use.
 * Requests are stateless (`store: false`): the whole conversation is sent every round.
 */

/**
 * Build HTTP headers for the Responses API
 * @param {object} config - API configuration
 * @returns {object} Headers object
 */
export function buildHeaders(config) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    const authHeader = config.authHeader || 'bearer';
    if (authHeader === 'bearer') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    } else {
      headers[authHeader] = config.apiKey;
    }
  }

  // Add custom headers if provided (can override auth)
  if (config.headers) {
    Object.assign(headers, config.headers);
  }

  return headers;
}

/**
 * Translate message content into Responses content parts
 * @param {string|Array} content - Chat Completions content
 * @param {string} role - Message role
 * @returns {string|Array} Responses content
 */
function toResponsesContent(content, role) {
  if (!Array.isArray(content)) {
    return content;
  }
  const textType = role === 'assistant' ? 'output_text' : 'input_text';
  return content.map((part) => {
    if (part?.type === 'text') {
      return { type: textType, text: part.text };
    }
    if (part?.type === 'image_url') {
      return { type: 'input_image', image_url: part.image_url?.url ?? part.image_url };
    }
    return part;
  });
}

/**
 * Translate Chat Completions messages into Responses input items
 * @param {Array} messages - Messages without the system messages
 * @returns {Array} Input items
 */
export function toInputItems(messages) {
  const items = [];
  for (const msg of messages) {
    // Items this adapter produced itself (function_call, function_call_output) pass through.
    if (msg.type) {
      items.push(msg);
      continue;
    }
    if (msg.role === 'tool') {
      items.push({
        type: 'function_call_output',
        call_id: msg.tool_call_id,
        output: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      });
      continue;
    }
    if (msg.content !== null && msg.content !== undefined && msg.content !== '') {
      items.push({ role: msg.role, content: toResponsesContent(msg.content, msg.role) });
    }
    if (msg.role === 'assistant' && Array.isArray(msg.tool_calls)) {
      for (const tc of msg.tool_calls) {
        items.push({
          type: 'function_call',
          call_id: tc.id,
          name: tc.function?.name,
          arguments: tc.function?.arguments || '{}',
        });
      }
    }
  }
  return items;
}

/**
 * Build request body for the Responses API
 * @param {Array} messages - Chat messages
 * @param {Array} tools - Tool definitions in wire format
 * @param {object} config - API configuration
 * @returns {object} Request body
 */
export function buildRequestBody(messages, tools, config) {
  const systemMessages = messages.filter((m) => m.role === 'system');
  const nonSystemMessages = messages.filter((m) => m.role !== 'system');

  // No temperature: the reasoning models this provider is for accept only their default.
  const body = {
    model: config.model,
    input: toInputItems(nonSystemMessages),
    stream: true,
    store: false,
    max_output_tokens: config.maxTokens,
  };

  if (systemMessages.length > 0) {
    body.instructions = systemMessages.map((m) => m.content).join('\n\n');
  }

  if (tools.length > 0) {
    body.tools = tools;
    body.tool_choice = 'auto';
  }

  return body;
}

/**
 * Parse the SSE stream of the Responses API
 * @param {ReadableStream} stream - Response body stream
 * @param {object} callbacks - Callback functions
 */
export async function parseStream(stream, callbacks) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  // Output items are numbered across messages, reasoning and calls; the editor numbers tool calls from 0.
  const toolCallIndexByOutputIndex = new Map();
  let finished = false;

  const handleEvent = (json) => {
    switch (json.type) {
      case 'response.output_text.delta':
        if (json.delta) {
          callbacks.onContent?.(json.delta);
        }
        break;
      case 'response.output_item.added':
        if (json.item?.type === 'function_call') {
          const index = toolCallIndexByOutputIndex.size;
          toolCallIndexByOutputIndex.set(json.output_index, index);
          callbacks.onToolCallDelta?.([
            {
              index,
              id: json.item.call_id,
              function: { name: json.item.name, arguments: json.item.arguments || '' },
            },
          ]);
        }
        break;
      case 'response.function_call_arguments.delta': {
        const index = toolCallIndexByOutputIndex.get(json.output_index);
        if (index !== undefined && json.delta) {
          callbacks.onToolCallDelta?.([{ index, function: { arguments: json.delta } }]);
        }
        break;
      }
      case 'response.completed':
        finished = true;
        callbacks.onFinish?.(toolCallIndexByOutputIndex.size > 0 ? 'tool_calls' : 'stop');
        break;
      case 'response.incomplete':
        finished = true;
        callbacks.onFinish?.(json.response?.incomplete_details?.reason === 'max_output_tokens' ? 'length' : 'stop');
        break;
      case 'response.failed':
        throw new Error(json.response?.error?.message || 'OpenAI Responses API request failed');
      case 'error':
        throw new Error(json.message || json.error?.message || 'OpenAI Responses API stream error');
      default:
        break;
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        let json;
        try {
          json = JSON.parse(trimmed.slice(6));
        } catch {
          // Ignore parse errors for incomplete chunks
          continue;
        }
        handleEvent(json);
      }
    }
  } finally {
    reader.releaseLock();
  }

  // The editor collects the tool calls when the stream finishes; a stream cut off early still ends the turn.
  if (!finished) {
    callbacks.onFinish?.(toolCallIndexByOutputIndex.size > 0 ? 'tool_calls' : 'stop');
  }
}

/**
 * Translate tools to the Responses wire format
 * @param {Array} tools - Tools in OpenAI Chat Completions format
 * @returns {Array} Tools in Responses format
 */
export function translateToolsToWireFormat(tools) {
  // strict defaults to true on the Responses API, which would reject the tools' optional parameters.
  return tools.map((tool) => ({
    type: 'function',
    name: tool.function.name,
    description: tool.function.description,
    parameters: tool.function.parameters,
    strict: false,
  }));
}

/**
 * Format tool result messages for next conversation round
 * @param {Array} toolCalls - Tool calls from assistant
 * @param {Array} toolResults - Tool execution results
 * @param {string} assistantContent - Assistant's text content
 * @returns {Array} Input items to append to conversation
 */
export function formatToolResultMessages(toolCalls, toolResults, assistantContent) {
  const items = [];

  if (assistantContent) {
    items.push({ role: 'assistant', content: assistantContent });
  }

  for (const tc of toolCalls) {
    items.push({
      type: 'function_call',
      call_id: tc.id,
      name: tc.function.name,
      arguments: tc.function.arguments || '{}',
    });
  }

  for (const tr of toolResults) {
    items.push({
      type: 'function_call_output',
      call_id: tr.tool_call_id,
      output: typeof tr.content === 'string' ? tr.content : JSON.stringify(tr.content),
    });
  }

  return items;
}
