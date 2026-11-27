import { describe, it, expect } from 'vitest';
import {
  buildHeaders,
  buildRequestBody,
  formatToolResultMessages,
  parseStream,
  translateToolsToWireFormat,
} from './openaiResponses.js';

// A response body that delivers the given SSE text in chunks of the given size, as a network would.
function sseStream(events, chunkSize = 7) {
  const text = events.map((event) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join('');
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream({
    start(controller) {
      for (let i = 0; i < bytes.length; i += chunkSize) {
        controller.enqueue(bytes.slice(i, i + chunkSize));
      }
      controller.close();
    },
  });
}

function recorder() {
  const calls = { content: '', toolCallDeltas: [], finish: [] };
  return {
    calls,
    callbacks: {
      onContent: (chunk) => { calls.content += chunk; },
      onToolCallDelta: (deltas) => { calls.toolCallDeltas.push(...deltas); },
      onFinish: (reason) => { calls.finish.push(reason); },
    },
  };
}

describe('buildHeaders', () => {
  it('sends the key as a bearer token unless another header is configured', () => {
    expect(buildHeaders({ apiKey: 'k' }).Authorization).toBe('Bearer k');
    expect(buildHeaders({ apiKey: 'k', authHeader: 'api-key' })['api-key']).toBe('k');
    expect('Authorization' in buildHeaders({ apiKey: '' })).toBe(false);
  });
});

describe('buildRequestBody', () => {
  it('moves the system prompt to instructions and sends a stateless request without temperature', () => {
    const body = buildRequestBody(
      [
        { role: 'system', content: 'You edit data contracts.' },
        { role: 'user', content: 'Add a field' },
        { role: 'assistant', content: 'Which one?' },
        { role: 'user', content: 'id' },
      ],
      [],
      { model: 'gpt-6.2-sol', maxTokens: 16384, temperature: 0.7 },
    );
    expect(body).toEqual({
      model: 'gpt-6.2-sol',
      instructions: 'You edit data contracts.',
      input: [
        { role: 'user', content: 'Add a field' },
        { role: 'assistant', content: 'Which one?' },
        { role: 'user', content: 'id' },
      ],
      stream: true,
      store: false,
      max_output_tokens: 16384,
    });
  });

  it('turns the tool turns of the Chat Completions shape into function call items', () => {
    const body = buildRequestBody(
      [
        { role: 'user', content: 'Show the contract' },
        { role: 'assistant', content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'getContract', arguments: '' } }] },
        { role: 'tool', tool_call_id: 'call_1', name: 'getContract', content: 'id: orders' },
      ],
      [],
      { model: 'm' },
    );
    expect(body.input).toEqual([
      { role: 'user', content: 'Show the contract' },
      { type: 'function_call', call_id: 'call_1', name: 'getContract', arguments: '{}' },
      { type: 'function_call_output', call_id: 'call_1', output: 'id: orders' },
    ]);
  });

  it('passes through the items of an earlier round and asks for tools when there are any', () => {
    const tools = translateToolsToWireFormat([
      { type: 'function', function: { name: 'getContract', description: 'Returns the contract', parameters: { type: 'object', properties: {} } } },
    ]);
    const roundTwo = formatToolResultMessages(
      [{ id: 'call_1', type: 'function', function: { name: 'getContract', arguments: '{}' } }],
      [{ tool_call_id: 'call_1', role: 'tool', name: 'getContract', content: 'id: orders' }],
      'Let me look.',
    );
    const body = buildRequestBody([{ role: 'user', content: 'Show the contract' }, ...roundTwo], tools, { model: 'm' });
    expect(body.tools).toEqual([
      { type: 'function', name: 'getContract', description: 'Returns the contract', parameters: { type: 'object', properties: {} }, strict: false },
    ]);
    expect(body.tool_choice).toBe('auto');
    expect(body.input).toEqual([
      { role: 'user', content: 'Show the contract' },
      { role: 'assistant', content: 'Let me look.' },
      { type: 'function_call', call_id: 'call_1', name: 'getContract', arguments: '{}' },
      { type: 'function_call_output', call_id: 'call_1', output: 'id: orders' },
    ]);
  });
});

describe('parseStream', () => {
  it('reports text deltas and finishes with stop', async () => {
    const { calls, callbacks } = recorder();
    await parseStream(sseStream([
      { type: 'response.created', response: { id: 'resp_1' } },
      { type: 'response.output_item.added', output_index: 0, item: { type: 'reasoning', id: 'rs_1' } },
      { type: 'response.output_item.added', output_index: 1, item: { type: 'message', id: 'msg_1' } },
      { type: 'response.output_text.delta', output_index: 1, delta: 'Hello ' },
      { type: 'response.output_text.delta', output_index: 1, delta: 'world' },
      { type: 'response.completed', response: { id: 'resp_1', status: 'completed' } },
    ]), callbacks);
    expect(calls.content).toBe('Hello world');
    expect(calls.toolCallDeltas).toEqual([]);
    expect(calls.finish).toEqual(['stop']);
  });

  it('numbers the function calls from 0 and finishes with tool_calls', async () => {
    const { calls, callbacks } = recorder();
    await parseStream(sseStream([
      { type: 'response.output_item.added', output_index: 0, item: { type: 'reasoning', id: 'rs_1' } },
      { type: 'response.output_item.added', output_index: 1, item: { type: 'function_call', id: 'fc_1', call_id: 'call_a', name: 'getContract', arguments: '' } },
      { type: 'response.function_call_arguments.delta', output_index: 1, delta: '{"pa' },
      { type: 'response.function_call_arguments.delta', output_index: 1, delta: 'th":"x"}' },
      { type: 'response.output_item.added', output_index: 2, item: { type: 'function_call', id: 'fc_2', call_id: 'call_b', name: 'validate', arguments: '' } },
      { type: 'response.completed', response: { status: 'completed' } },
    ]), callbacks);
    expect(calls.toolCallDeltas).toEqual([
      { index: 0, id: 'call_a', function: { name: 'getContract', arguments: '' } },
      { index: 0, function: { arguments: '{"pa' } },
      { index: 0, function: { arguments: 'th":"x"}' } },
      { index: 1, id: 'call_b', function: { name: 'validate', arguments: '' } },
    ]);
    expect(calls.finish).toEqual(['tool_calls']);
  });

  it('reports a response cut off at the token limit as length', async () => {
    const { calls, callbacks } = recorder();
    await parseStream(sseStream([
      { type: 'response.output_text.delta', output_index: 0, delta: 'Part' },
      { type: 'response.incomplete', response: { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' } } },
    ]), callbacks);
    expect(calls.finish).toEqual(['length']);
  });

  it('throws the message of a failed response', async () => {
    const { callbacks } = recorder();
    await expect(parseStream(sseStream([
      { type: 'response.failed', response: { status: 'failed', error: { code: 'server_error', message: 'The model failed' } } },
    ]), callbacks)).rejects.toThrow('The model failed');
  });

  it('throws the message of an error event', async () => {
    const { callbacks } = recorder();
    await expect(parseStream(sseStream([
      { type: 'error', code: 'rate_limit_exceeded', message: 'Rate limit reached' },
    ]), callbacks)).rejects.toThrow('Rate limit reached');
  });

  it('still finishes the turn when the stream ends without a completed event', async () => {
    const { calls, callbacks } = recorder();
    await parseStream(sseStream([{ type: 'response.output_text.delta', output_index: 0, delta: 'Hi' }]), callbacks);
    expect(calls.finish).toEqual(['stop']);
  });
});
