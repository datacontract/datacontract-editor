import { describe, it, expect, afterEach, vi } from 'vitest';
import { createAutoValuesSlice, initialAutoValuesState } from './autoValuesSlice.js';

afterEach(() => {
  vi.restoreAllMocks();
  delete global.fetch;
});

// Minimal fake zustand store backed by a plain object.
function makeStore(editorConfig, yaml = 'id: x') {
  let state = { editorConfig, yaml, autoValues: { ...initialAutoValuesState } };
  const get = () => state;
  const set = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
  };
  state = { ...state, ...createAutoValuesSlice(set, get) };
  return { get, set };
}

const okResponse = (body) => ({ ok: true, json: () => Promise.resolve(body) });

describe('createAutoValuesSlice', () => {
  it('does nothing without autoValues.url', async () => {
    global.fetch = vi.fn();
    const { get } = makeStore({});
    await get().refreshAutoValues();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(get().autoValues.status).toBe('idle');
  });

  it('posts the current yaml and stores the values per property', async () => {
    const properties = { classification: { values: ['Restricted'], warning: 'Weaker' } };
    global.fetch = vi.fn().mockResolvedValue(okResponse({ properties }));
    const { get } = makeStore({ autoValues: { url: '/org/auto' } }, 'id: shelf-warmers');

    await get().refreshAutoValues();

    expect(global.fetch).toHaveBeenCalledWith('/org/auto', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ yaml: 'id: shelf-warmers' }),
    }));
    expect(get().autoValues).toEqual({ byProperty: properties, status: 'ready' });
  });

  it('keeps the previous values when a refresh fails', async () => {
    const properties = { classification: { values: ['Restricted'] } };
    global.fetch = vi.fn()
      .mockResolvedValueOnce(okResponse({ properties }))
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { get } = makeStore({ autoValues: { url: '/org/auto' } });

    await get().refreshAutoValues();
    await get().refreshAutoValues();

    expect(get().autoValues).toEqual({ byProperty: properties, status: 'error' });
  });

  it('drops a response that arrives after a newer request started', async () => {
    let resolveFirst;
    global.fetch = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValueOnce(okResponse({ properties: { classification: { values: ['Public'] } } }));
    const { get } = makeStore({ autoValues: { url: '/org/auto' } });

    const first = get().refreshAutoValues();
    await get().refreshAutoValues();
    resolveFirst(okResponse({ properties: { classification: { values: ['Restricted'] } } }));
    await first;

    expect(get().autoValues.byProperty.classification.values).toEqual(['Public']);
  });
});
