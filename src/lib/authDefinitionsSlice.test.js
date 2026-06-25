import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAuthDefinitionsSlice, initialAuthDefinitionsState } from './authDefinitionsSlice.js';

beforeEach(() => {
  global.window = { location: { href: 'https://app.example.com/editor', hostname: 'app.example.com' } };
});
afterEach(() => {
  vi.restoreAllMocks();
  delete global.window;
});

// Minimal fake zustand store backed by a plain object.
function makeStore(initialEditorConfig, yamlParts) {
  let state = { editorConfig: initialEditorConfig, yamlParts, authDefinitions: { ...initialAuthDefinitionsState } };
  const get = () => state;
  const set = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
  };
  const slice = createAuthDefinitionsSlice(set, get);
  state = { ...state, ...slice };
  return { get, set, slice: state };
}

const ad = (url) => ({ type: 'semantics', url });

describe('createAuthDefinitionsSlice', () => {
  it('idle when no batchSemanticsUrl; resolveAuthDefinition single-fetches', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ name: 'X' }) });
    const { get } = makeStore({ semantics: {} }, { authoritativeDefinitions: [ad('/org/definitions/x')] });
    await get().collectAndFetchAuthDefinitions();
    expect(get().authDefinitions.status).toBe('idle');

    const data = await get().resolveAuthDefinition('/org/definitions/x');
    expect(data).toEqual({ name: 'X' });
    expect(global.fetch).toHaveBeenCalledTimes(1); // single fetch, not batch
  });

  it('batch mode populates byUrl and serves cache hits without refetching', async () => {
    const map = { 'https://app.example.com/org/definitions/x': { name: 'X' } };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(map) });
    const { get } = makeStore(
      { batchSemanticsUrl: 'https://api/batch', semantics: {} },
      { authoritativeDefinitions: [ad('/org/definitions/x')] },
    );

    await get().collectAndFetchAuthDefinitions();
    expect(get().authDefinitions.status).toBe('ready');
    expect(get().authDefinitions.byUrl['https://app.example.com/org/definitions/x']).toEqual({ name: 'X' });

    const data = await get().resolveAuthDefinition('/org/definitions/x');
    expect(data).toEqual({ name: 'X' });
    expect(global.fetch).toHaveBeenCalledTimes(1); // batch only; cache hit, no extra call
  });

  it('lazy-fetches and merges a URL missing from the batch', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ name: 'Lazy' }) });
    const { get } = makeStore(
      { batchSemanticsUrl: 'https://api/batch', semantics: {} },
      { authoritativeDefinitions: [] },
    );
    await get().collectAndFetchAuthDefinitions();

    const data = await get().resolveAuthDefinition('/org/definitions/late');
    expect(data).toEqual({ name: 'Lazy' });
    expect(get().authDefinitions.byUrl['https://app.example.com/org/definitions/late']).toEqual({ name: 'Lazy' });
  });

  it('skips the batch request when no internal definition URLs are present', async () => {
    global.fetch = vi.fn();
    const { get } = makeStore(
      { batchSemanticsUrl: 'https://api/batch', semantics: {} },
      { authoritativeDefinitions: [] },
    );
    await get().collectAndFetchAuthDefinitions();
    expect(get().authDefinitions.status).toBe('ready');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('batch error sets status error and resolveAuthDefinition falls back to single fetch', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'err' }) // batch fails
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ name: 'Fallback' }) }); // single
    const { get } = makeStore(
      { batchSemanticsUrl: 'https://api/batch', semantics: {} },
      { authoritativeDefinitions: [ad('/org/definitions/x')] },
    );
    await get().collectAndFetchAuthDefinitions();
    expect(get().authDefinitions.status).toBe('error');

    const data = await get().resolveAuthDefinition('/org/definitions/x');
    expect(data).toEqual({ name: 'Fallback' });
  });

  it('lazy-fetches a URL the batch response omitted', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ 'https://app.example.com/org/definitions/x': { name: 'X' } }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ name: 'Lazy' }) });
    const { get } = makeStore(
      { batchSemanticsUrl: 'https://api/batch', semantics: {} },
      { authoritativeDefinitions: [ad('/org/definitions/x')] },
    );
    await get().collectAndFetchAuthDefinitions();
    expect(get().authDefinitions.status).toBe('ready');

    const data = await get().resolveAuthDefinition('/org/definitions/late');
    expect(data).toEqual({ name: 'Lazy' });
    expect(get().authDefinitions.byUrl['https://app.example.com/org/definitions/late']).toEqual({ name: 'Lazy' });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('returns null for external URLs in batch mode', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const { get } = makeStore({ batchSemanticsUrl: 'https://api/batch', semantics: {} }, { authoritativeDefinitions: [] });
    await get().collectAndFetchAuthDefinitions();
    expect(await get().resolveAuthDefinition('https://other-host.com/x')).toBeNull();
  });
});
