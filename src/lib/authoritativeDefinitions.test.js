import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { collectAuthoritativeDefinitionUrls, fetchAuthoritativeDefinitionsBatch } from './authoritativeDefinitions.js';

// urlUtils reads window.location; stub a same-host base for the node test env.
beforeEach(() => {
  global.window = { location: { href: 'https://app.example.com/editor', hostname: 'app.example.com' } };
});
afterEach(() => {
  vi.restoreAllMocks();
  delete global.window;
});

const sem = (url, extra = {}) => ({ type: 'semantics', url, ...extra });

describe('collectAuthoritativeDefinitionUrls', () => {
  it('collects internal semantic and definition URLs from every nesting level', () => {
    const contract = {
      authoritativeDefinitions: [sem('https://app.example.com/org/definitions/root')],
      description: { authoritativeDefinitions: [{ type: 'definition', url: '/org/definitions/desc' }] },
      schema: [
        {
          authoritativeDefinitions: [sem('/org/definitions/schemaA')],
          properties: [
            { authoritativeDefinitions: [{ type: 'semantic', url: '/org/definitions/propA' }] },
          ],
        },
      ],
    };
    const urls = collectAuthoritativeDefinitionUrls(contract);
    expect(urls).toContain('https://app.example.com/org/definitions/root');
    expect(urls).toContain('https://app.example.com/org/definitions/desc');
    expect(urls).toContain('https://app.example.com/org/definitions/schemaA');
    expect(urls).toContain('https://app.example.com/org/definitions/propA');
    expect(urls).toHaveLength(4);
  });

  it('skips non-definition types, external URLs, and entries without a URL', () => {
    const contract = {
      authoritativeDefinitions: [
        { type: 'videoTutorial', url: '/org/definitions/video' },
        sem('https://other-host.com/org/definitions/ext'),
        { type: 'semantics' },
      ],
    };
    expect(collectAuthoritativeDefinitionUrls(contract)).toEqual([]);
  });

  it('de-duplicates repeated URLs', () => {
    const contract = {
      authoritativeDefinitions: [sem('/org/definitions/x'), sem('/org/definitions/x')],
      schema: [{ authoritativeDefinitions: [sem('/org/definitions/x')] }],
    };
    expect(collectAuthoritativeDefinitionUrls(contract)).toEqual(['https://app.example.com/org/definitions/x']);
  });

  it('tolerates null / malformed input', () => {
    expect(collectAuthoritativeDefinitionUrls(null)).toEqual([]);
    expect(collectAuthoritativeDefinitionUrls(undefined)).toEqual([]);
    expect(collectAuthoritativeDefinitionUrls({ authoritativeDefinitions: 'nope' })).toEqual([]);
    expect(collectAuthoritativeDefinitionUrls({ authoritativeDefinitions: [null, 42] })).toEqual([]);
  });
});

describe('fetchAuthoritativeDefinitionsBatch', () => {
  it('POSTs { urls } and returns the parsed map', async () => {
    const map = { '/a': { name: 'A' } };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(map) });
    const result = await fetchAuthoritativeDefinitionsBatch('https://api/batch', ['/a'], 'application/json');
    expect(result).toEqual(map);
    expect(global.fetch).toHaveBeenCalledWith('https://api/batch', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'Content-Type': 'application/json', Accept: 'application/json' }),
      body: JSON.stringify({ urls: ['/a'] }),
    }));
  });

  it('throws on a non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
    await expect(fetchAuthoritativeDefinitionsBatch('https://api/batch', ['/a'])).rejects.toThrow();
  });
});
